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

        const _id = commandObject?.id || "0";

        switch (commandName) {
            case "bal": {
                return msg.reply({
                    embeds: [{
                        color: 4095,
                        title: "Command Name: Balance",
                        description: `View your current balance with this command through a simple </bal:${_id}>`,
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
                            value: `When the Pokemon spawns, use </catch:${_id}> and type in the Pokemon's English or Alternative Name.`
                        }, {
                            name: "Congratulations!",
                            value: "You have just caught a Pokemon, make sure to info them!"
                        }]
                    }]
                });

            case "vote":
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
                            value: `</dex:${_id}> pokemon:<name>\n- Example: \`/dex pokemon:pikachu\`\n- Example: \`/dex pokemon:ディアルガ\`\n- Example: \`/dex pokemon:dialga shiny:true\``
                        }, {
                            name: "Record Progress",
                            value: `</dex:${_id}> progress:true\n- Example: \`/dex progress:true\`\n- Example: \`/dex progress:true page:1\``
                        }, {
                            name: "Claim Your Reward",
                            value: `</dex:${_id}> claim:true\n- Note: All unclaimed Pokemon will be marked as claimed and the reward will be directly transferred to your account.`
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
                            value: `</start:${_id}>`
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
                            value: `</pick:${_id}> pokemon:<name>\n- Example: \`/pick pokemon:charmander\`\n- Example: \`/pick pokemon:pikachu\`\n- Example: \`/pick pokemon:eevee\``
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
                            value: `</info:${_id}> query:<number or "latest">\n- Example: /info query:1\n- Example: /info l\n- Example: /info latest`
                        }]
                    }]
                });

            case "inv":
            case "inventory":
                return await msg.reply({
                    embeds: [{
                        title: "Command Name: Inventory",
                        description: "Look up details on items, their prices, descriptions, and even how much you have in stock!",
                        color: 0x8fe060,
                        fields: [{
                            name: "Usage (Inventory)",
                            value: `</inventory:${_id}>\n- Example: /inventory\n- Example: /inventory page:2`
                        }, {
                            name: "Usage (Item Details)",
                            value: `</inventory:${_id}> item-id:<item-name>`
                        }, {
                            name: "Usage (Crates)",
                            value: `</inventory:${_id}> item-id:<Crate Name> use:[<Amount>]\n- Example: \`/inventory item-id: Wooden Crate use: 4\` Use 4 Wooden Crates\n- Example: \`/inventory item-id: Silver Crate use: 1\` Use 1 Silver Crate`
                        }]
                    }]
                });

            case "nickname":
                return await msg.reply({
                    embeds: [{
                        title: "Command Name: Nickname",
                        description: "Change the name of your Pokemon. \n- Inappropriate names will result in persecution.\n- Punishment will vary based on the severity of the offense.",
                        fields: [{
                            name: "Usage (Current Pokemon Only)",
                            value: `</nickname:${_id}> name:<new name>\n- Example: \`/nickname name:King of Persia\``
                        }]
                    }]
                });

            case "order":
                return await msg.reply({
                    embeds: [{
                        color: 0xe0c960,
                        title: "Command Name: Order",
                        description: "Change the order of how your Pokemon are listed in the /pokemon command.",
                        fields: [{
                            name: "Usage",
                            value: `</order:${_id}> style:<IV | IDX | Level | Alphabetic> order:<Ascending | Descending>\n- Example: \`/order style:iv order:descending\`\n- Example: \`/order style:level order:ascending\``
                        }]
                    }]
                });

            case "profile":
                return await msg.reply({
                    embeds: [{
                        color: 0xb1e060,
                        title: "Command Name: Profile",
                        description: "Show Off your Pokemon Trainer card to people around the world!",
                        fields: [{
                            name: "Usage (Listing)",
                            value: `</profile listing:${_id}>`
                        }, {
                            name: "Usage (Registration)",
                            value: `</profile start:${_id}> character:<name> gender:<gender>\n- Example: \`/profile start character:Red Gender:Male\`\n- Example: \`/profile start character:Dawn Gender:Female\``
                        }, {
                            name: "Usage (Profile)",
                            value: `</profile view:${_id}>`
                        }]
                    }]
                });

            case "redeem":
                return await msg.reply({
                    embeds: [{
                        color: 0xff884d,
                        title: "Command Name: Redeem",
                        description: "Check your current Credits and Redeems balance. You can trade the Redeems for Credits and even Pokemon! Feeling generous?, you can gift them too!",
                        fields: [{
                            name: "Usage (Balance)",
                            value: `</redeem info:${_id}>`
                        }, {
                            name: "Usage (Redeem Credits) (Self)",
                            value: `</redeem self:${_id}> credits: true`
                        }, {
                            name: "Usage (Gift Credits)",
                            value: `</redeem gift:${_id}> credits:<@user>\n- Example: \`/redeem gift credits: @Anthony\``,
                        }, {
                            name: "Usage (Gift Redeems)",
                            value: `</redeem gift:${_id}> redeem:<@user>\n- Example: \`/redeem gift redeem: @Anthony\``,
                            inline: true
                        }, {
                            name: "Usage (Redeem Pokemon) (Spawn) (Self)",
                            value: `</redeem self:${_id}> spawn:<pokemon name>\n- Example: \`/redeem self spawn: dialga\``,
                        }, {
                            name: "Usage (Redeem Pokemon) (Direct) (Self)",
                            value: `</redeem self:${_id}> get-pokemon:<pokemon name>\n- Example: \`/redeem self get-pokemon: dialga\``,
                            inline: true
                        }]
                    }]
                });

            case "release":
                return await msg.reply({
                    embeds: [{
                        color: 0x6b7eb0,
                        title: "Command Name: Release",
                        description: "Times have become harder.\nYou and your friends must eventually say goodbye.\nThis world was temporary,\nit had its pleasures.\n\nCome times with eternal regrets.\nIf one or two partways,\nPartways,\nNot partways.\nCome together,\nDo not fall apart.\n\n\n- Irreversible, becareful before proceeding",
                        fields: [{
                            name: "Usage (Selected Pokemon)",
                            value: `</release:${_id}> id:<Pokemon ID>\n- Example: \`/release id:20\`\n- Example: \`/release id:30\``
                        }, {
                            name: "Usage (Latest Pokemon)",
                            value: `</release:${_id}> latest:true`
                        }]
                    }]
                });

            case "reindex":
                return await msg.reply({
                    embeds: [{
                        color: 0xffffff,
                        title: "Command Name: Reindex",
                        description: "This command reorganizes your Pokemon list. We sincerely apologize for not automating this but this was to ensure lower-loadtimes and decreased CPU+Memory Usage.",
                        fields: [{
                            name: "Usage",
                            value: `</reindex:${_id}>`
                        }]
                    }]
                });

            case "select":
                return await msg.reply({
                    embeds: [{
                        title: "Command Name: Select",
                        description: "Choose what Pokemon is worthy enough to be leveled up and used in battle! Organize your dream team.",
                        fields: [{
                            name: "Usage (Select Pokemon)",
                            value: `</select:${_id}> slot:<number> id:<pokemonID>\n- Example: \`/select slot: 2 id: 30\`\n- Example: \`/pokemon id:1\``
                        }, {
                            name: "Usage (Clear Table)",
                            value: `</select:${_id}> clear: true`
                        }]
                    }]
                });

            case "team":
                return await msg.reply({
                    embeds: [{
                        color: 0xf0fc03,
                        title: "Command Name: Team",
                        description: "View the Dream Team you have crafted using the /select command.",
                        fields: [{
                            name: "Usage",
                            value: `</team:${_id}>`
                        }]
                    }]
                });

            // Dev Note: Personally not a fan of marketing animals, but you can't stop something that's been there for generations. 
            // You can only make people believe it's gone.
            case "market":
                return await msg.reply({
                    embeds: [{
                        color: 0xfc0303,
                        title: "Command Name: Market",
                        description: "Look up for Pokemon you wish to buy or sell your own.",
                        fields: [{
                            name: "Search Pokemon",
                            value: `</market search:${_id}> [numerous parameters]\n- Example: \`/market search name:Pikachu iv-greater:50 shiny:true\`\n- Example: \`/market search iv-lesser:5 spd-lesser:2 nature:docile\`\n- Example: \`/market search user_id:688446585524584502\`\n- Example: \`/market search sorting_order: Sort by IV Descending\`\n- Example: \`/market search name:pikachu page:50\``
                        }, {
                            name: "Buy Pokemon",
                            value: `</market buy:${_id}> id:<Pokemon ID\n- Example: \`/market buy id:5141332\`\n\n_You can find the id through the search command_`
                        }, {
                            name: "Sell Pokemon",
                            value: `</market sell:${_id}> id:<Pokemon ID> cost:<Price>\n- Example: \`/market sell id:40 cost: 200\`\n- Example: \`/market sell id:300 cost:10000\``
                        }]
                    }]
                });

            case "moves":
                return await msg.reply({
                    embeds: [{
                        color: 0xca03fc,
                        title: "Command Name: Moves",
                        description: "View information on Moves, set available ones, and buy TMs!",
                        fields: [{
                            name: "View Current Moves",
                            value: `</moves info:${_id}>`
                        }, {
                            name: "View Available Level-Up Moves",
                            value: `</moves info:${_id}> level-moves:true\n- Example: \`/moves info level-moves:true\`\n- Example: \`/moves info level-moves:true pokemon-slot:3\``
                        }, {
                            name: "View Available TM Moves",
                            value: `</moves info:${_id}> tm-moves:true\n- Example: \`/moves info tm-moves:true\`\n- Example: \`/moves info tm-moves:true pokemon-slot:2\``
                        }, {
                            name: "View Move Details",
                            value: `</moves info:${_id}> move-info:<Name>\n- Example: \`/moves info move-info:Thunder Punch\`\n- Example: \`/moves info move-info:Hydro Pump\``
                        }, {
                            name: "Set Move of Pokemon",
                            value: `</moves store:${_id}> move-id:<Level Move ID> tm-id:<TM Move ID> move-slot:<Move Slot>\n- Example: \`/moves store move-id:Thunder Punch\`\n- Example: \`/moves store tm-id:Curse\`\n- Example: \`/moves store move-id:Fire Punch move-slot:3\`\n- Example: \`/moves store move-id:Thunder Punch move-slot:2 pokemon-slot:3\``
                        }],
                        footer: {
                            text: "pokemon-slot is the slot number of the pokemon in your team || You can only view and set moves of your team"
                        }
                    }]
                });

            case "voucher":
                return await msg.reply({
                    embeds: [{
                        color: 0x2dfc03,
                        title: "Command Name: Voucher",
                        description: "Got a voucher? Woah! Get a Gem, Credits, or even an event-Pokemon. Take your chances.",
                        fields: [{
                            name: "Usage",
                            value: `</voucher:${_id}> code:<Voucher Code>\n- Example: \`/voucher code:0700fe9a-772a-4975-b338-a41623da9360\``
                        }]
                    }]
                });

            case "shop":
                return await msg.reply({
                    embeds: [{
                        title: "Command Name: Shop",
                        description: "Buy Backgrounds, Evolution-Exclusive items, Rare-Candies, and much much more!",
                        color: 0x594aff,
                        fields: [{
                            name: "Buying Forms & Stones",
                            value: `</shop forms:${_id}> item-name:<Item Name>\n- Example: \`/shop stones\` item-name:Water Stone (while having Eevee selected)\n- Example: \`/shop forms pokemon-id: 20 item-name:Vaccuum\` (Rotom)`
                        }, {
                            name: "Changing Pokemon Nature",
                            value: `</shop nature:${_id}> nature:<Nature> id:[<Pokemon ID>]\n- Example: \`/shop nature nature:Timid\`\n- Example: \`/shop nature nature:Evil id:101\``
                        }, {
                            name: "Rare Candy",
                            value: `</shop xp:${_id}> buy:Rare Candy\n- Example: \`/shop xp buy:Rare Candy\` (One Rare Candy)\n- Example: \`/shop xp buy:Rare Candy amount: 50\` (50 Rare Candies)\n\n- Only the Selected Pokemon is given the treat for now.`
                        }]
                    }]
                });

            case "config":
                return await msg.reply({
                    embeds: [{
                        title: "Command Name: Config",
                        description: "Set up spawn redirection and language control (🔜) for your server, channel, and even yourself.\n- Note that you can disable commands individually through the Application Manager in the Server Settings.",
                        fields: [{
                            name: "Check All Configurations",
                            value: `</config check:${_id}>`
                        }, {
                            name: "Server Spawn Redirection",
                            value: `</config set:${_id}> guild_feature: Redirect Spawns channels:<Mention Channels>\n- Example: \`/config set guild_features: Redirect Spawn channels:#general #ash-grave #oak-has-kids\``
                        }, {
                            name: "Disable Server-wide Spawn",
                            value: `</config set:${_id}> state: Disable guild_feature: Redirect Spawns\n- Example: \`/config set state: Disable guild_features: Redirect Spawn\``
                        }, {
                            name: "Unset Spawn Redirection",
                            value: `</config unset:${_id}> guild_feature: Redirect Spawns\n- Example: \`/config unset guild_features:Unset Spawn Redirection\``
                        }]
                    }]
                });

            case "duel":
                return await msg.reply({
                    embeds: [{
                        title: "Command Name: Duel",
                        description: "Ready to test out your strength? Your strategies? Challenge your rival! Get stronger!",
                        fields: [{
                            name: "Starting a Duel",
                            value: `</duel start:${_id}> vs-user-1:<User>\n- Example: \`/duel start vs-user-1: Anthony\`\n- Example: \`/duel start 2-user-vs:PikaNinja vs-user-1:Anthony vs-user-2:Alpha\` (2v2)\n\n**Note**: 3v3 is supported as well!`
                        }, {
                            name: "Attack",
                            value: `</duel actions:${_id}> attack:<First -> Forth Move> attack-user:[<User 1 - 3>]\n- Example: \`/duel actions attack:Second Attack\`\n- Example: \`/duel actions attack:Forth Attack attack-user:3\` (3rd User)`
                        }, {
                            name: "Switch Pokemon",
                            value: `</duel actions:${_id}> switch:<First - Sixth Pokemon>\n- Example: \`duel actions switch: Second Pokemon\``
                        }, {
                            name: "Dynamax Gigamax",
                            value: `</duel actions:${_id}> dyna-giga:true`
                        }, {
                            name: "Check your Team Status",
                            value: `</duel team:${_id}>`
                        }, {
                            name: "Check your Moves",
                            value: `</duel moves:${_id}>`
                        }]
                    }]
                });

            case "trade":
                return await msg.reply({
                    embeds: [{
                        color: 0x59ffd0,
                        title: "Command Name: Trade",
                        description: "Trade Pokemon, Redeems, and Credits with one another! Maybe someone might evolve. :D",
                        fields: [{
                            name: "Start Trade",
                            value: `</trade request:${_id}> user:<User>\n- Example: \`/trade request user:Anthony\``
                        }, {
                            name: "Add/Remove a Single Pokemon to the Trade",
                            value: `</trade add:${_id}> pokemon:<Pokemon Search>\n- Example: \`/trade add pokemon:Pikachu\`\n- Example: \`/trade remove pokemon:Pikachu\``
                        }, {
                            name: "Mass Add/Remove Pokemon to the Trade",
                            value: `</trade add:${_id}> mass:<IDs of Pokemon>\n</trade remove:${_id}> mass:<IDs of Pokemon>\n- Example: \`/trade add mass:1, 5, 7, 8, 2323\``
                        }, {
                            name: "Add/Remove Credits",
                            value: `</trade add:${_id}> credit:<Amount>\n</trade remove:${_id}> credit:<Amount>\n- Example: \`/trade add credit: 2000\`\n- Example: \`/trade remove credit: 2000\``
                        }, {
                            name: "Add/Remove Redeems",
                            value: `</trade add:${_id}> redeem:<Amount>\n</trade remove:${_id}> redeem:<Amount>\n- Example: \`/trade add redeem: 1\`\n- Example: \`/trade remove redeem: 2\``
                        }, {
                            name: "Confirm Trade",
                            value: `Both parties must use </trade confirm:${_id}>`
                        }]
                    }]
                });

            case "pokemon":
                return await msg.reply({
                    embeds: [{
                        color: 0xfcba03,
                        title: "Command Name: Pokemon",
                        description: "Use powerful filters to narrow down your Pokemon list with basic query parameters! Looking for a Pikachu? Type its name in the query string. Looking for Pokemon above 90% IV? Type it `iv > 90`. Detailed explanation will be the following.",
                        fields: [{
                            name: "Basic Usage",
                            value: `</pokemon:${_id}> page:<Page Number> orderby:<ID | IV | Level | Alphabetic> ordertype:<Ascending | Descending> query:[Query Parameters]\n- Example: \`/pokemon query:iv < 10 pikachu spd < 5\``
                        }, {
                            name: "IV-Based Query",
                            value: `</pokemon:${_id}> query:[iv|hp|spd|atk|spatk|spdef] > 20\n- Example: \`/pokemon query:hp < 10 atk > 26 spd > 20\`\n- Example: \`/pokemon query:atk < 20 def < 20\``
                        }, {
                            name: "Name-Based Query",
                            value: `</pokemon:${_id}> query:<Pokemon Name>\n- Example: \`/pokemon query:Pikachu\`\n- Example: \`/pokemon query:Charizard\`\n- Example: \`/pokemon query:Arceus atk > 20\``
                        }, {
                            name: "Shiny Query",
                            value: `</pokemon:${_id}> query:shiny`
                        }, {
                            name: "Frogs, Eggs and Eeveelutions Query",
                            value: `</pokemon:${_id}> query:--frog\n</pokemon:${_id}> query:--egg\n</pokemon:${_id}> query:--eeveelution`
                        }, {
                            name: "UltraBeast, Mythical, and Legendary Query",
                            value: `</pokemon:${_id}> query:--ub\n</pokemon:${_id}> query:--legendary\n</pokemon:${_id}> query:--mythic`
                        }, {
                            name: "Region Query",
                            value: `</pokemon:${_id}> query:galar\n</pokemon:${_id}> query:alola`
                        }, {
                            name: "Triple and Quadriple IVs",
                            value: `</pokemon:${_id}> query:tri\n</pokemon:${_id}> query:qua`
                        }, {
                            name: "Example of Filters",
                            value: `\`/pokemon query:legendary iv > 80 shiny\` (Shiny 80%+ IV Legendaries)\n\`/pokemon query:spd > 30 Pikachu\`\n\`/pokemon query:region page:2\``
                        }]
                    }]
                });

            default:
                return msg.reply("Thank you for selecting the Help Command, be sure to type one of the command names down to learn how to use it.");
        }
    }
}
