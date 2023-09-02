import { SlashCommandBuilder } from "discord.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Flex your awesome profile and even customize it!')
        .addSubcommand(x => x
            .setName("start")
            .setDescription("Be sure to fill up all the required options to start your adventure!")
            .addIntegerOption(y => y
                .setRequired(true)
                .addChoices({
                    "name": "Red",
                    "value": 1
                }, {
                    "name": "Victor",
                    "value": 2
                }, {
                    "name": "Blue",
                    "value": 3
                }, {
                    "name": "Dawn",
                    "value": 4
                }, {
                    "name": "Leaf",
                    "value": 5
                }, {
                    "name": "Ethan",
                    "value": 6
                }, {
                    "name": "Brendan",
                    "value": 7
                }, {
                    "name": "May",
                    "value": 8
                }, {
                    "name": "Elio",
                    "value": 9
                })
            )
            .addStringOption(y => y
                .setName("gender")
                .setDescription("Are you a boy or a girl? ~ (Professor Oak)")
                .addChoices({
                    name: "Male",
                    value: "male"
                }, {
                    name: "Female",
                    value: "female"
                }, {
                    name: "Undisclosed",
                    value: "undisclosed"
                })
                .setRequired(true)
            )
        )
        .addSubcommand(y => y
            .setName("listing")
            .setDescription("See the available character options")),
    async execute(msg) {

        const subCommand = msg.options.getSubcommand();

        switch (subCommand) {
            case "listing": {
                msg.reply({
                    embeds: [{
                        title: "Use the following character code for the start function when needed.",
                        image: {
                            url: "https://i.imgur.com/CqawkU5.png"
                        }
                    }]
                })
            }
                break;

            case "start": {

            }
                break;
        }
    }
}
