const fs = require("fs");

function write(data) {
    fs.writeFile("./commands/times.json", JSON.stringify(data), (err) => {
        if (err) console.log(err);
        console.log("Successfully Written to File.");
    });
}

module.exports = {
    name: "clear",
    description: "description",
    execute(message, args, Discord) {
        if (message.author.bot) return;
        //Do things
        write({});
        message.reply("done!");
    },
};
