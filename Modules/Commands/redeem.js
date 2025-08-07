import { MessageFlags, SlashCommandBuilder } from "discord.js";
import Player from "../../Classes/player.js";
import Pokedex from "../../Classes/pokedex.js";
import capitalize from "../../Utilities/Misc/capitalize.js";
import { Chance } from "chance";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('redeem').setNameLocalizations({
            "es-ES": "redimir",
            "pt-BR": "resgate",
            "de": "gutscheineinlösen"
        }).setDescription("Redeems are a special currency obtainable through donating")
        .addSubcommand(option => option
            .setName("info")
            .setDescription("Check out what you can do with your redeems!")
        )
        .addSubcommand(option => option
            .setName("gift")
            .setDescription("Gift someone a Redeem or Credits! (1 redeem per usage)")
            .addUserOption(x => x
                .setName("credits")
                .setDescription("Gift 10K Credits to someone.")
            )
            .addUserOption(x => x
                .setName("redeem")
                .setDescription("Gift someone a Redeem (Please remember that this command is limited to one redeem per usage)")
            )
        )
        .addSubcommand(option => option
            .setName("self")
            .setDescription("Get credits or a Pokemon! (1 redeem per usage)")
            .addBooleanOption(x => x
                .setName("credits")
                .setDescription("Get 10K Credits.")
            )
            .addStringOption(x => x
                .setName("spawn")
                .setDescription("Write down the name of the Pokemon you wish to spawn.")
            )
            .addStringOption(x => x
                .setName("get-pokemon")
                .setDescription("Write down the name of the Pokemon you wish.")
            )
        )
        .addSubcommand(option => option
            .setName("event")
            .setDescription("Buy and Sell Event Deems to get Event Pokemon!")
            .addBooleanOption(x => x
                .setName("buy")
                .setDescription("Buy Special Deems for 2 redeems")
            )
            .addIntegerOption(x => x
                .setName("amount")
                .setDescription("The amount of Special Deems you plan to get.")
                .setMinValue(1)
                .setMaxValue(10)
            )
            .addBooleanOption(x => x
                .setName("view")
                .setDescription("View how many Special Deems you have left")
            )
            .addBooleanOption(x => x
                .setName("use")
                .setDescription("Use the deems you have to randomly get a special Pokemon")
            )
        )
        .addSubcommand(x => x
            .setName("help").setDescription("Check out how to use the Market Command and apparently abandon what you gained trust of!")
        ),
    async execute(msg) {

        // Redirect to Help if called
        if (msg.options.getSubcommand() == "help")
            return msg.options._hoistedOptions.push({ name: "command_name", type: 3, value: "redeem" }),
                msg.client.commands.get("help")(msg);

        // Fetch User
        const player = new Player({ id: msg.user.id });

        await player.fetch(msg.client.postgres);

        if (!player.started)
            return await msg.reply("You have not started your adventure yet...");

        // Fetch Redeems
        let { bal, redeem, special_deem } = await player.fetchIncome(msg.client.postgres);

        // Check SubCommand
        const SubCommand = msg.options.getSubcommand();

        // IF SubCommand was used
        if (SubCommand) {

            switch (SubCommand) {
                // IF user plans to use command for themself
                case "self": {
                    if (!redeem)
                        return await msg.reply("Sorry, you do not have enough credits for that...");

                    // Assign Constants
                    const credits = msg.options.getBoolean('credits'),
                        spawn = msg.options.getString('spawn'),
                        getPokemon = msg.options.getString("get-pokemon");

                    // IF user wants Credits
                    if (credits)
                        return await player.save(msg.client.postgres, { redeem: --redeem, bal: bal + 1e4 }),
                            await msg.reply("10K pokedits were deposited to your account");

                    // IF user decides to Spawn or getPokemon
                    if (spawn || getPokemon) {

                        // Check if Pokemon selected is valid
                        const selectedPokemon = spawn || getPokemon;

                        const pokedex = new Pokedex({});

                        await pokedex.searchForID(selectedPokemon);

                        // Reject if Pokemon not found
                        if (!pokedex.pokedex.id)
                            return await msg.reply("That Pokemon does not exist");

                        // Fetch Rarity
                        // const rarity = await pokedex.checkRarity();

                        // IF nonSpawn, reject
                        if (pokedex.pokedex.is_custom || pokedex.pokedex.is_nonspawnable)
                            return await msg.reply("That Pokemon cannot be given or spawned.");

                        if (spawn) {
                            // Init Spawn if not existent
                            if (!msg.channel.spawn) msg.channel.spawn = {};
                            // Initializing New Pokemon
                            msg.channel.spawn.pokemon = pokedex;
                            // Spawn Pokemon Execution
                            await msg.channel.spawn.pokemon.SpawnFriendlyV2(true);
                            // Send Message
                            await msg.channel.spawn.pokemon.spawnToChannel(msg.channel);
                            // Reduce Redeem
                            await player.save(msg.client.postgres, { redeem: --player.redeem });
                            // Reply
                            return await msg.reply({ flags: MessageFlags.Ephemeral, content: "Pokemon Spawned!" });
                        } else {
                            // Ready Spawn Type Data
                            await pokedex.SpawnFriendlyV2(true);
                            // Attach User
                            pokedex.user_id = BigInt(msg.user.id);

                            // Increment readied IDX
                            const [idx] = await msg.client.postgres`SELECT idx FROM pokemon WHERE user_id = ${msg.user.id} ORDER BY idx desc`;
                            pokedex.idx = idx.idx || 1;

                            // Save to DB
                            await pokedex.save(msg.client.postgres);

                            // Reduce Redeem
                            await player.save(msg.client.postgres, { redeem: --player.redeem });

                            // Send Message
                            return await msg.reply(`<@${msg.user.id}> successfully recieved the ${capitalize(pokedex.pokemon)} (${pokedex.level}).`);
                        }
                    }
                    return
                }
                // IF user plants to use command for someone else
                case "gift": {

                    if (!redeem)
                        return await msg.reply("Sorry, you do not have enough credits for that...");

                    const redeems = msg.options.getUser("redeem"),
                        credits = msg.options.getUser('credits');

                    if (redeems || credits) {

                        const user = redeems || credits;

                        const selectedPlayer = new Player({ id: user.id });

                        await selectedPlayer.fetch(msg.client.postgres);

                        if (!selectedPlayer.started)
                            return await msg.reply("User has not started their journey...");

                        if (redeems)
                            return await msg.client.postgres.begin(sql => [sql`UPDATE users SET redeem = redeem - 1 WHERE id = ${player.id};`, sql`UPDATE users SET redeem = redeem + 1 WHERE id = ${selectedPlayer.id};`]),
                                await msg.reply("Redeem was gifted to the user you specified... Good job! :O");

                        if (credits)
                            return await msg.client.postgres.begin(sql => [sql`UPDATE users SET redeem = redeem - 1 WHERE id = ${player.id};`, sql`UPDATE users SET bal = bal + 10000 WHERE id = ${selectedPlayer.id};`]),
                                await msg.reply("Credits were gifted to the user you specified... Whoever they may be, they must be happy to have you as a friend.");
                    }
                }
                case "event": {

                    if (msg.options.getBoolean('view'))
                        return msg.reply({
                            embeds: [{
                                title: `❄️ Snowy Event ❄️ ${special_deem || 0} ❄️`,
                                description: "Welcome to Pokedi's Christmas and Snow Event! Come around and enjoy the warm fireplace and some hot coco. We got plenty around to share!\n\nFor every Special Deem, have a chance to win a Wintery Pokemon, and if your luck's really got a thing for you, get a legendary Snow-Event Pokemon!",
                                color: 0x005284,
                                fields: [{
                                    name: "-----",
                                    value: `Special Prizes await`
                                }],
                                image: {
                                    url: "https://cdn.discordapp.com/attachments/688616004758011993/1187838541707874394/image.png"
                                }
                            }]
                        });

                    if (msg.options.getBoolean('buy')) {
                        // Amount of Special Deems
                        const amount = msg.options.getInteger("amount") || 1;

                        if (redeem < 2)
                            return msg.reply("You require 2 deems to buy a Snowflake!");

                        if (amount * 2 > redeem)
                            return msg.reply("You do not have enough redeems to buy that many snowflakes");

                        await msg.client.postgres`UPDATE users SET special_deem = special_deem + ${amount}, redeem = redeem - ${amount * 2} WHERE id = ${msg.user.id}`;

                        return await msg.reply("❄️ A beautiful snowflake fell into your bag ❄️");
                    }

                    if (msg.options.getBoolean("use")) {

                        if (special_deem < 1)
                            return await msg.reply("You haven't acquired a Snowflake yet!");

                        // Access JSON
                        const { default: event } = await import("../../Utilities/Data/events.json", { type: "json" } );

                        // Event Name
                        const eventName = 'snow-event-2023'

                        // Selected Pokemon
                        const selectedPokemon = Chance().weighted(event[eventName].pokemon, event[eventName].pokemon.map(x => x.chance));

                        // Ready Pokedex
                        const pokedex = new Pokedex({});

                        await pokedex.fetchByID(selectedPokemon.id, true);

                        // Reject if Pokemon not found
                        if (!pokedex.pokedex.id)
                            return await msg.reply("That Pokemon does not exist");

                        // Ready Spawn Type Data
                        await pokedex.SpawnFriendlyV2(true);

                        // Attach User
                        pokedex.user_id = BigInt(msg.user.id);

                        // Increment readied IDX
                        const [idx] = await msg.client.postgres`SELECT idx FROM pokemon WHERE user_id = ${msg.user.id} ORDER BY idx desc`;

                        pokedex.idx = idx.idx || 1;

                        // Save to DB
                        await pokedex.save(msg.client.postgres);

                        // Reduce Redeem
                        await msg.client.postgres`UPDATE users SET special_deem = special_deem - 1 WHERE id = ${msg.user.id}`;

                        // Send Message
                        return await msg.reply(`As a Snowflake melts, <@${msg.user.id}> successfully recieves a ${capitalize(pokedex.pokemon, true)} (${pokedex.level}).`);
                    }
                }
            }
        }

        return msg.reply({
            embeds: [{
                color: 44678,
                title: `Your Redeems: ${redeem} 💸`,
                description: "Redeems are a paid virtual currency, used for buying Pokémon, spawning them, or sending them as a gift to an existing user. Even the same can be done for 10K Credits.",
                fields: [{
                    name: `</redeem:${msg.commandId}> self spawn:pokemon`,
                    value: "Use this to spawn the Pokémon of your choice!"
                }, {
                    name: `</redeem:${msg.commandId}> self get-pokemon:<pokemon name>`,
                    value: "Use this to directly get a Pokemon in your inventory"
                }, {
                    name: `</redeem:${msg.commandId}> self credits`,
                    value: "Use this to get 10K credits"
                }, {
                    name: `</redeem:${msg.commandId}> gift [credits/redeem]:<user>`,
                    value: "Use this to gift 10K credits or a redeem to a user"
                }]
            }]
        });

    }
}
