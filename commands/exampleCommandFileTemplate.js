module.exports = {
    name: "name",
    description: "description",
    execute(message, args, Discord) {
        //Do things
        if (message.author.bot) return;
    },
};
