const fs = require("fs");

function write(data) {
    fs.writeFile("./commands/times.json", JSON.stringify(data), (err) => {
        if (err) console.log(err);
        console.log("Successfully Written to File.");
    });
}
function read(todo) {
    return fs.readFile("./commands/times.json", "utf-8", (err, data) => {
        if (err) {
            console.log(err);
        }
        todo(data);
    });
}

function compare(times) {
    var timesCopy = [...times];
    var last;

    timesCopy.forEach((r) => {
        if (!last || r[0] > last[1]) {
            last = [...r];
        }
        if (r[1] < last[1]) last[1] = [...r][1];
        if (r[0] > last[0]) last[0] = [...r][0];
    });
    return last;
}

module.exports = {
    name: "free",
    description: "when r u free",
    execute(message, args, Discord) {
        if (message.author.bot) return;
        //Do things
        if (args[0]) {
            let quit = false;

            [-1, 0, args[0].length - 1].forEach((loc) => {
                if (args[0].indexOf("-") == loc) {
                    message.reply("yo dummy thats not how this works");
                    quit = true;
                    return true;
                }
                return false;
            });
            if (quit) return true;
        }
        if (args.length > 1) {
            message.reply(
                "I normally only take 1 time frame per person, but I'll make an exception"
            );
            message.channel.send(`Processing the request as ${args[0]}`);
        }
        const newTime = !args[0]
            ? []
            : args[0]
                  .split("-")
                  .map((newarg) => newarg.trim())
                  .map((time) => {
                      const col = time.indexOf(":");
                      if (col != -1) {
                          return (
                              time.slice(0, col) +
                              "." +
                              (parseInt(time.slice(col + 1)) / 60) * 100
                          );
                      }
                      return time;
                  });
        const alwaysFree = newTime.length == 0;

        read((rawData) => {
            const data = JSON.parse(rawData);
            const person = message.author.username;

            data[person] = {
                alwaysFree: alwaysFree,
                times: newTime,
            };

            if (Object.keys(data).length >= 3) {
                //Decide

                const times = Object.entries(data)
                    .map((person) => Object.entries(person[1])[1][1])
                    .filter((times) => times.length != 0);
                message.channel.send(
                    `Looks like everyone is free from ${compare(times)
                        .map((time) => {
                            const col = time.indexOf(".");
                            if (col != -1) {
                                return (
                                    time.slice(0, col) +
                                    ":" +
                                    (parseInt(time.slice(col + 1)) / 100) * 60
                                ).toString();
                            }
                            return time.toString();
                        })
                        .join(" to ")}`
                );
            }
            write(data);
        });

        message.reply("All set!");
    },
};
