function DoTheThing(
    message,
    args,
    Discord,
    boxes,
    width,
    height,
    targets,
    level
) {
    const moves = ["⬅️", "⬆️", "➡️", "⬇️"];
    let exitGame = false;

    //emoji variables
    const border = ":blue_square:";
    const bg = ":orange_square:";
    const person = ":poo:";
    const box = ":brown_square:";
    const target = ":yellow_circle:";

    const player = { x: 0, y: 0 };
    let score = 0;

    const generateBoard = () => {
        boxes.some((box) => {
            let breakOut = false;
            targets.some((target) => {
                if (box.x == target.x && box.y == target.y) {
                    score += 1;
                    const remove = (list, item) => {
                        const ind = list.indexOf(item);
                        list.splice(ind, 1);
                    };
                    remove(boxes, box);
                    remove(targets, target);
                    breakOut = true;
                }
                return breakOut;
            });
            return breakOut;
        });
        if (boxes.length == 0 && targets.length == 0) {
            if (level + 1 >= 4) {
                message.suppressEmbeds(true);
                exitGame = true;
                resetMoves(message, false);
                message.edit("You Win!");
            } else {
                level += 1;
                message.channel.send("Great job!");
                [boxes, targets] = makeBoxesAndTargets(
                    level * 2 + 1,
                    width,
                    height
                );
            }
        }

        const board = Array.from(Array(height), () => new Array(width).fill(0));

        targets.forEach((target) => {
            board[target.y][target.x] = 3;
        });
        boxes.forEach((box) => {
            board[box.y][box.x] = 2;
        });

        board[player.y][player.x] = 1;

        const edge = border.repeat(width + 2) + "\n";
        const block_map = {
            0: bg,
            1: person,
            2: box,
            3: target,
        };
        const mid = board
            .map(
                (row) =>
                    border +
                    row.map((block) => block_map[block]).join("") +
                    border
            )
            .join("\n");

        return edge + mid + "\n" + edge;
    };

    //continue a game
    function resetMoves(Message, onlyuser = true) {
        const userReactions = [...Message.reactions.cache.values()].filter(
            (reaction) => {
                if (
                    !onlyuser ||
                    [...reaction.users.cache.values()].length > 1 ||
                    moves.indexOf(reaction.emoji.name) == -1
                ) {
                    return reaction;
                }
            }
        );

        try {
            for (const reaction of userReactions) {
                const toRemove = [...reaction.users.cache.values()].filter(
                    (user) => {
                        if (!user.bot || !onlyuser) {
                            return user.id;
                        }
                    }
                );
                toRemove.forEach((id) => {
                    reaction.users.remove(id);
                });
            }
        } catch (error) {
            console.error("Failed to remove reactions.");
        }
    }
    if (
        message.author.bot &&
        message.embeds[0] &&
        message.embeds[0].title == "Game Time"
    ) {
        message
            .react(moves[0])
            .then(() => message.react(moves[1]))
            .then(() => message.react(moves[2]))
            .then(() => message.react(moves[3]))
            .catch(() => console.error("One of the emojis failed to react."));
        const filter = (reaction, user) => {
            if (!moves.includes(reaction.emoji.name)) {
                message.channel.send(
                    "Hey there, maybe stick to the arrow emojis!"
                );
                resetMoves(message);
                return false;
            }
            return !user.bot;
        };
        function ReactionListener(message) {
            message
                .awaitReactions(filter, {
                    max: 1,
                    time: 600000,
                    errors: ["time"],
                })
                .then((collected) => {
                    const reaction = collected.first();

                    if (moves.indexOf(reaction.emoji.name) == -1) {
                        message.channel.send(
                            "Hey there, maybe stick to the arrow emojis! :)"
                        );
                    }
                    const moveFunc = (axis, amount) => {
                        let bias = 0;
                        if (axis == "x") {
                            boxes.some((box) => {
                                if (
                                    box.y == player.y &&
                                    box.x == player.x + amount
                                ) {
                                    bias = amount;
                                    if (
                                        player.x + amount * 2 >= 0 &&
                                        player.x + amount * 2 < width
                                    ) {
                                        box.x += amount;
                                    } else {
                                        const wallPos = box.x;
                                        box.x = player.x;
                                        player.x = wallPos;
                                    }

                                    return true;
                                }
                                return false;
                            });
                            if (
                                player.x + amount + bias >= 0 &&
                                player.x + amount + bias < width
                            ) {
                                player.x += amount;
                            }
                        } else if (axis == "y") {
                            boxes.some((box) => {
                                if (
                                    box.y == player.y + amount &&
                                    box.x == player.x
                                ) {
                                    bias = amount;
                                    if (
                                        player.y + amount * 2 >= 0 &&
                                        player.y + amount * 2 < height
                                    ) {
                                        box.y += amount;
                                    } else {
                                        const wallPos = box.y;
                                        box.y = player.y;
                                        player.y = wallPos;
                                    }

                                    return true;
                                }
                                return false;
                            });
                            if (
                                player.y + amount + bias >= 0 &&
                                player.y + amount + bias < height
                            ) {
                                player.y += amount;
                            }
                        }
                    };
                    const moveWithInput = {
                        "⬅️": () => {
                            moveFunc("x", -1);
                        },
                        "⬆️": () => {
                            moveFunc("y", -1);
                        },
                        "➡️": () => {
                            moveFunc("x", 1);
                        },
                        "⬇️": () => {
                            moveFunc("y", 1);
                        },
                    };
                    moves.some((dir) => {
                        if (reaction.emoji.name == dir) {
                            //move the player based on input
                            moveWithInput[dir]();

                            //generate the game board and place the player
                            //Generate/edit the message
                            const embed = new Discord.MessageEmbed()
                                .setColor("#f4900c")
                                .setTitle("Game Time")
                                .setDescription(generateBoard())
                                .addFields([
                                    { name: "Score:", value: score },
                                    { name: "Level:", value: level },
                                ]);

                            message.edit(embed).catch(console.error);
                        }
                    });
                    if (!exitGame) {
                        ReactionListener(message);
                        resetMoves(message);
                    }
                    return;
                })
                .catch(console.error);
        }
        ReactionListener(message);
    }
    if (message.author.bot) return;

    const embed = new Discord.MessageEmbed()
        .setColor("#f4900c")
        .setTitle("Game Time")
        .setDescription(generateBoard())
        .addFields([
            { name: "Score:", value: score },
            { name: "Level:", value: level },
        ]);

    message.channel.send(embed).then(() => {
        const newMessage = [...message.channel.messages.cache.values()].slice(
            -1
        )[0];
        DoTheThing(
            newMessage,
            [],
            Discord,
            boxes,
            width,
            height,
            targets,
            level
        );
    });
}

function makeBoxesAndTargets(boxAmount, width, height) {
    const boxes = [];
    const targets = [];
    for (var i = 0; i < boxAmount; i++) {
        const newBox = () => {
            const box = {
                x: Math.floor(Math.random() * width),
                y: Math.floor(Math.random() * height),
            };
            let recurse = false;
            if (box.x == 0 && box.y == 0) {
                recurse = true;
            }
            return recurse ? newBox() : box;
        };

        boxes.push(newBox());
    }
    for (var i = 0; i < boxAmount; i++) {
        const newTarget = () => {
            const target = {
                x: Math.floor(Math.random() * width),
                y: Math.floor(Math.random() * height),
            };
            let recurse = false;
            boxes.some((box) => {
                if (box.x == target.x && box.y == target.y) {
                    recurse = true;
                    return true;
                }
                return false;
            });
            return recurse ? newTarget() : target;
        };

        targets.push(newTarget());
    }
    return [boxes, targets];
}

module.exports = {
    name: "game",
    description: "play a game",
    execute(message, args, Discord) {
        const runTheFunction = async () => {
            let level = 1;
            const boxAmount = level * 2 + 1;
            const width = 10;
            const height = 8;

            const [boxes, targets] = makeBoxesAndTargets(
                boxAmount,
                width,
                height
            );

            DoTheThing(
                message,
                args,
                Discord,
                boxes,
                width,
                height,
                targets,
                level
            );
            //IDIOT BE SURE TO CHANGE IT WHEN YOU CALL THE DO_THE_THING FUNCTION AGAIN A FEW LINES UP
        };

        runTheFunction();
    },
};
