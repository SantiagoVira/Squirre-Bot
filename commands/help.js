module.exports = {
    name: "help",
    description: "help",
    execute(message, args, Discord) {
        //Do things
        const embed = new Discord.MessageEmbed()
            .setColor(Math.floor(Math.random() * 16777215).toString(16))
            .setTitle("Help has arrived")
            .setDescription(
                "I'm here to help you do things that are easily done by humans... but it was possible to be automated so now I exist."
            )
            .addFields(
                {
                    name: "$free",
                    value:
                        "Use this to let me know when you are free.\n**Syntax: ** *$free [from]-[to]*\nP.S. My programmer was.. ~~high on sleep deprivation~~ a little tired when he made me, so please just stick to the syntax or I might freak the fuck out k thx!\nP.P.S. If you just write *$free* I take that as you being free all day",
                },
                {
                    name: "$status",
                    value:
                        "This lets me tell you when you are recorded as free. If you think you may have a similar schedule as yesterday, you can check with ***$status***",
                }
            );

        message.channel.send(embed);
    },
};
