import { SlashCommandBuilder } from "discord.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Look up a command and their usages")
        .addStringOption(option => option
            .setName("command_name")
            .setDescription("The name of the command you want the details and instructions of")),
    async execute(msg) {

        const commandName = msg.options.getString("command_name");

        const commandObject = msg.client.commands.get(commandName)?.rest;

        switch (commandName) {
            case "bal": {
                return msg.reply({
                    embeds: [{
                        color: 4095,
                        title: "Command Name: Balance",
                        description: `View your current balance with this command through a simple </bal:${commandObject?.id || "0"}>`,
                        footer: {
                            text: "You may have unique pikachus show up depending on how much redeems you have :D"
                        }
                    }]
                });
            }

            case "catch":
                return await msg.reply({
                    embeds: [{
                        color: 4095,
                        title: "Command Name: Catch",
                        description: "Use this command to catch the Pokemon that has just spawned! Do note that the alternate names are also supported. You can catch Dialga with not only `Dialga` but also its Japanese name `ディアルガ`",
                        fields: [{
                            name: "Step 1",
                            value: "Wait for the Pokemon to Show up after talking enough"
                        }, {
                            name: "Step 2",
                            value: `When the Pokemon spawns, use </catch:${commandObject?.id || "0"}> and type in the Pokemon's English or Alternative Name.`
                        }, {
                            name: "Congratulations!",
                            value: "You have just caught a Pokemon, make sure to info them!"
                        }]
                    }]
                });

            case "daily":
                return await msg.reply({
                    embeds: [{
                        color: 0xffffff,
                        title: "Command Name: Daily",
                        description: "Keep track of your streak while having a chance to gain great rewards! It's simple as just clicking a single button, mind the captchas and ads that the providers have in store.\n\n- Rewards are listed with their prizes, but how likely you are to gain the exclusive awards depend on your Karma.",
                        fields: [{
                            name: "Step 1",
                            value: `Visit [this](https://pokedi.xyz/vote) link`
                        }, {
                            name: "Step 2",
                            value: "Login to Top.GG"
                        }, {
                            name: "Step 3",
                            value: "After you've logged in, you'll be redirected to the vote page again"
                        }, {
                            name: "Step 4",
                            value: "Bear few seconds of ads till the button is lit up. (Ad-Blockers will reject the vote - in most cases)"
                        }, {
                            name: "Step 5",
                            value: "After clicking the button, the bot will direct you the reward to your account and send you a message"
                        }, {
                            name: "Congratulations!",
                            value: "You have recieved a decent reward for your effort"
                        }]
                    }]
                });

            case "dex":
                return await msg.reply({
                    embeds: [{
                        color: 0xfe1232,
                        title: "Command Name: Dex",
                        description: "Look up details on the Pokemon, check your progress, and even reap what you've sown!\n- Pokemon Details include how to level them up, their alternative spellings, along with other forms _possibly_ obtainable.",
                        fields: [{
                            name: "Look-Up Pokemon Information",
                            value: `</dex:${commandObject?.id || "0"}> pokemon:<name>\n- Example: \`/dex pokemon:pikachu\`\n- Example: \`/dex pokemon:ディアルガ\`\n- Example: \`/dex pokemon:dialga shiny:true\``
                        }, {
                            name: "Record Progress",
                            value: `</dex:${commandObject?.id || "0"}> progress:true\n- Example: \`/dex progress:true\`\n- Example: \`/dex progress:true page:1\``
                        }, {
                            name: "Claim Your Reward",
                            value: `</dex:${commandObject?.id || "0"}> claim:true\n- Note: All unclaimed Pokemon will be marked as claimed and the reward will be directly transferred to your account.`
                        }]
                    }]
                });

            case "start":
                return await msg.reply({
                    embeds: [{
                        color: 0x2cde5c,
                        title: "Command Name: Start",
                        description: "The formal introduction to all the possible Pokemon you can choose as your starter.\n- Secret starters come-by every now and then, make sure to invite a player to help them get one!",
                        fields: [{
                            name: "Usage",
                            value: `</start:${commandObject?.id || "0"}>`
                        }]
                    }]
                });

            case "pick":
                return await msg.reply({
                    embeds: [{
                        color: 0xdcfa34,
                        title: "Command Name: Pick",
                        description: "For new fledgling adventurers to embark on their journey, they must pick a partner to come along! Check on the /start command and see who's willing to join. Remember, once you've picked a partner, he's yours for life.",
                        fields: [{
                            name: "Usage",
                            value: `</pick:${commandObject?.id || "0"}> pokemon:<name>\n- Example: \`/pick pokemon:charmander\`\n- Example: \`/pick pokemon:pikachu\`\n- Example: \`/pick pokemon:eevee\``
                        }]
                    }]
                });

            case "info":
                return await msg.reply({
                    embeds: [{
                        color: 0x34f7fa,
                        title: "Command Name: Info",
                        description: "View detailed statistics of your Pokemon. From IVs to Friendship, EXP to Levels, keep note of it all!",
                        fields: [{
                            name: "Usage",
                            value: `</info:${commandObject?.id || "0"}> query:<number or "latest">\n- Example: /info query:1\n- Example: /info l\n- Example: /info latest`
                        }]
                    }]
                });

            case "inventory":
                return await msg.reply({
                    embeds: [{
                        title: "Command Name: Inventory",
                        description: "Look up details on items, their prices, descriptions, and even how much you have in stock!",
                        color: 0x8fe060,
                        fields: [{
                            name: "Usage (Inventory)",
                            value: `</inventory:${commandObject?.id || "0"}>\n- Example: /inventory\n- Example: /inventory page:2`
                        }, {
                            name: "Usage (Item Details)",
                            value: `</inventory:${commandObject?.id || "0"}> item-id:<item-name>`
                        }]
                    }]
                })
        }
    }
}
