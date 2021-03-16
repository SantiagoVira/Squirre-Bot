//Set up the actual bot
const { AsyncLocalStorage } = require("async_hooks");
const Discord = require("discord.js");
const client = new Discord.Client();
const prefix = "$";

// Prepare for commands
const fs = require("fs");
client.commands = new Discord.Collection();

// Get all commands and store them
const commandFiles = fs
    .readdirSync("./commands/")
    .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// Send a message once ready
client.once("ready", () => {
    console.log("Consider thyself ready"); // Nice
});

// Go through each message and check for commands, act on commands
client.on("message", (message) => {
    // if (
    //     message.author.bot &&
    //     message.embeds[0] &&
    //     message.embeds[0].title == "Game Time"
    // ) {
    //     client.commands
    //         .get("game")
    //         .execute(message, ["Don't Make Boxes"], Discord);
    // }
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

const login = async () => {
    let token = "";
    await fs.readFile("./tokenThing.txt", "utf-8", async (err, data) => {
        if (err) {
            console.log(err);
        }
        token = data.toString();
        client.login(token);
    });
};
login();
