//Set up the actual bot
const Discord = require("discord.js");
const client = new Discord.Client();
const prefix = "$";

//Prepare for commands
const fs = require("fs");
client.commands = new Discord.Collection();

//Get all commands and store them
const commandFiles = fs
    .readdirSync("./commands/")
    .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

//Send a message once ready
client.once("ready", () => {
    console.log("Consider thyself ready");
});

//Go through each message and check for commands, act on commands
client.on("message", (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content
        .slice(prefix.length)
        .split(/ +/)
        .map((arg) => arg.toLowerCase());
    const command = args.shift();

    commandFiles.forEach((file) => {
        const name = file.slice(0, -3);
        if (command === name) {
            client.commands.get(name).execute(message, args, Discord);
        }
    });
});

//Must Be Last Line
client.login("ODE1OTk4MDc3NTAwNTIyNTg2.YD0jbg.jajGeV9mu53Lar0PKsD724Wockk");
