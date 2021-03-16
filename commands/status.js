const fs = require("fs");

function read(todo) {
    return fs.readFile("./commands/times.json", "utf-8", (err, data) => {
        if (err) {
            console.log(err);
        }
        todo(data);
    });
}

module.exports = {
    name: "status",
    description: "description",
    execute(message, args, Discord) {
        if (message.author.bot) return;
        //Do things
        read((rawData) => {
            const data = JSON.parse(rawData);
            const person = message.author.username;

            if (!data[person]) {
                message.reply(
                    "Dummy you can't check your status if you've never set it"
                );
                return;
            }
            message.reply(
                `It looks like you are free ${
                    data[person].alwaysFree
                        ? `the whole day`
                        : `from ${data[person].times[0]} to ${data[person].times[1]}`
                }`
            );
        });
    },
};
