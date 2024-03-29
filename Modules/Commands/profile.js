import { SlashCommandBuilder } from "discord.js";
import generateProfile from "../../Utilities/User/generateProfile.js";
import Player from "../../Classes/player.js";
import getDominantColor from "../../Utilities/Misc/getDominantColor.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Flex your awesome profile and even customize it!')
        .addSubcommand(x => x
            .setName("view")
            .setDescription("See your current Profile")
        )
        .addSubcommand(x => x
            .setName("start")
            .setDescription("Be sure to fill up all the required options to start your adventure!")
            .addIntegerOption(y => y
                .setRequired(true)
                .setName("character")
                .setDescription("Select the character you connect to most!")
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
        .addSubcommand(x => x
            .setName("listing")
            .setDescription("See the available character options"))
        .addSubcommand(x => x
            .setName("help").setDescription("Check out how to use the Market Command and apparently abandon what you gained trust of!")
        ),
    async execute(msg) {

        const subCommand = msg.options.getSubcommand();

        switch (subCommand) {
            case "help":
                return msg.options._hoistedOptions.push({ name: "command_name", type: 3, value: "moves" }),
                    msg.client.commands.get("help")(msg);

            case "listing": {
                return await msg.reply({
                    embeds: [{
                        title: "Use the following character code for the start function when needed.",
                        image: {
                            url: "https://i.imgur.com/CqawkU5.png"
                        }
                    }]
                });
            }

            case "start": {

                const player = new Player({ id: msg.user.id });

                await player.fetch(msg.client.postgres);

                if (!player.started) return await msg.reply("Please make sure to /pick a pokemon!");
                if (player.character) return await msg.reply("You already started your adventure");

                return await msg.client.postgres`UPDATE users SET background = 1, character = ${msg.options.getInteger("character")}, gender = ${msg.options.getString("gender")} WHERE id = ${msg.user.id}`,
                    await msg.reply("Your profile has been created! Use /profile to see it.");
            }

            default: {

                const player = new Player({ id: msg.user.id });

                await player.fetch(msg.client.postgres);

                if (!player.started) return await msg.reply("Please make sure to /pick a pokemon!");

                if (!player.selected)
                    return await msg.reply("Please select a Pokemon to load with you!");

                const profileMessage = await msg.reply({ content: "Please wait...", fetchReply: true });

                const profileImage = await generateProfile(msg.client.postgres, player, msg.user.globalName || msg.user.username);

                if (!profileImage) return await msg.reply("Profile could not be created. Maybe a Pokemon was not selected?");

                return await profileMessage.edit({
                    content: null,
                    files: [{
                        attachment: profileImage,
                        name: "profile.png"
                    }],
                    embeds: [{
                        color: await getDominantColor(`../pokediAssets/profile/backgrounds/${player.background || "1"}.png`, true),
                        image: {
                            url: "attachment://profile.png"
                        },
                    }]
                });
            }
        }
    }
}
