import { InteractionCollector, InteractionType, SlashCommandBuilder } from "discord.js";
import Pokemon from "../../Classes/pokemon.js";
import Player from "../../Classes/player.js";
import buttonVerification from "../../Utilities/Core/buttonVerification.js";
import capitalize from "../../Utilities/Misc/capitalize.js";

// Functions
function createField(trade) {
    let fields = [];

    for (const id of Object.keys(trade)) {
        let totalPokemon = trade[id].p.map(x => x);
        if (trade[id].p.length > 0) {
            let counter = 0;
            while (totalPokemon && totalPokemon.length >= 20 && counter < 3 || counter == 0) {
                fields.push({
                    name: `${trade[id].username} is offering | ${trade[id].confirm ? "✅" : ""}`,
                    value: '```\n' + (totalPokemon.splice(0, 20).map(x => {
                        return (` ${x.idx} - ${capitalize(x.pokemon)} ${x.shiny ? "⭐" : ""} | Level: ${x.level} | ${x.pokemon == "egg" ? "-" : (((x.s_hp + x.s_spd + x.s_atk + x.s_def + x.s_spatk + x.s_spdef) / 186) * 100).toFixed(2)}%`);
                    }
                    ).join("\n") || " ") + '```'
                });
                counter++;
            }
        }
        fields.push({
            name: `${trade[id].username} is offering | ${trade[id].confirm ? "✅" : ""}`,
            value: `${trade[id].c || 0} Credits\n${trade[id].r || 0} Redeems${totalPokemon.length > 0 ? `\n${totalPokemon.length} also in the list` : ""}`
        });
    }

    return fields;
}

// Pokemon that evolve when Traded
let trade_pokemon = {
    kadabra: "alakazam",
    machoke: "machamp",
    graveler: "golem",
    "graveler-alola": "golem-alola",
    haunter: "gengar",
    boldore: "gigalith",
    gurdurr: "conkeldurr",
    pumpkaboo: "gourgeist",
    phantump: "trevenant",
    poliwhirl: "politoed",
    slowpoke: "slowking",
    onix: "steelix",
    scyther: "scizor",
    seadra: "kingdra",
    porygon: "porygon2",
    clamperl: "huntail",
    clamperl: "gorebyss",
    rhydon: "rhyperior",
    electabuzz: "electivire",
    magmar: "magmortar",
    porygon2: "porygon-z",
    dusclops: "dusknoir",
    swirlix: "slurpuff",
    shelmet: "accelgor",
    karrablast: "escavalier",
    spritzee: "aromatisse"
}

// Evolve Pokemon function
function evolvePokemon(pokemon) {
    if (trade_pokemon[pokemon]) {
        return trade_pokemon[pokemon];
    } else return pokemon;
}

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('trade').setNameLocalizations({
            "es-ES": "intercambio",
            "pt-BR": "trocar",
            "de": "tausch"
        })
        .setDescription('Release your pokemon')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add [pokemon, credit, redeem]')
                .addIntegerOption(option => option.setName("pokemon").setAutocomplete(true).setDescription("Select a pokemon to add to the trade"))
                .addIntegerOption(option => option.setName("credit").setDescription("Add credits to the trade"))
                .addIntegerOption(option => option.setName("redeem").setDescription("Add redeems to the trade"))
                .addStringOption(option => option.setName("mass").setDescription("Mass add pokemon to the trade by their IDs"))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove [pokemon, credit, redeem]')
                .addIntegerOption(option => option.setName("pokemon").setAutocomplete(true).setDescription("Select a pokemon to remove from the trade"))
                .addIntegerOption(option => option.setName("credit").setDescription("Remove credits to the trade"))
                .addIntegerOption(option => option.setName("redeem").setDescription("Remove redeems to the trade"))
                .addStringOption(option => option.setName("mass").setDescription("Mass remove pokemon to the trade by their IDs"))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("request")
                .setDescription('Mention a user you wish to trade with')
                .addMentionableOption(option => option.setName('user').setDescription('Select a user'))
        ).addSubcommand(subcommand =>
            subcommand
                .setName("confirm")
                .setDescription('Confirm the trade between you and the mysterious merchant')
        ).addSubcommand(subcommand =>
            subcommand
                .setName("cancel")
                .setDescription('Cancel the trade between you and the mysterious merchant')
        ).addSubcommand(subcommand => subcommand
            .setName("help").setDescription("Check out how to use the Market Command and apparently abandon what you gained trust of!")
        ),
    async execute(msg) {

        // Redirect to Help if Called
        if (msg.options.getSubcommand("help"))
            return msg.options._hoistedOptions.push({ name: "command_name", type: 3, value: "trade" }),
                msg.client.commands.get("help")(msg);


        // Get Member instead of ID
        const Tradee = msg.options.getMember('user');

        // Ready User [Will be used in multiple places regardless]
        const You = new Player(msg.user);

        if (Tradee) {

            // First Level restriction
            if (!Tradee.user || Tradee.user.id == msg.user.id)
                return msg.reply("You did not mention a user...");

            // Fetch User
            await You.fetch(msg.client.postgres);

            // Check if User is in Trade
            if (await You.isTrading(msg.client.redis))
                return msg.reply("No. You're still trading my dude. =w=");

            // Check if User is in the Market
            if (await You.isMarketing(msg.client.redis))
                return msg.reply("Finish your shopping you bum.");

            const Them = new Player({ id: BigInt(Tradee.user.id) });

            // Check if Tradee is in Trade
            if (await Them.isTrading(msg.client.redis))
                return await msg.reply("Your dude is trading somewhere else. =w=");

            // Check if User is in the Market
            if (await Them.isMarketing(msg.client.redis))
                return await msg.reply("Your friend here needs to finish shopping.");

            // Reject self-trading
            if (Them.id == You.id) return msg.reply("No, you cannot trade with yourself. That's just... sad...");

            // Start Verification
            let verification = await buttonVerification({ interaction: msg, users: [You.id.toString(), Them.id.toString()], title: "You are Trading now! Please verify!" });

            // Reject failure
            if (!verification) return msg.followUp(`You both need to click on the button to verify the trade.`);

            // FollowUp
            await msg.followUp("Trade verified");

            // Fetch User
            await Them.fetch(msg.client.postgres);

            if (!Them.started)
                return msg.followUp("User has not started their adventure. /start just in case. :3");

            // Set users Trading
            await You.setTrading(msg.client.redis, Them.id.toString());
            await Them.setTrading(msg.client.redis, You.id.toString());

            const _trade = {
                [You.id]: { c: 0, r: 0, p: [], confirm: false, username: msg.user.username || msg.user.globalName },
                [Them.id]: { c: 0, r: 0, p: [], confirm: false, username: Tradee.username || Tradee.globalName }
            };

            const tradeMSG = await msg.followUp({ embeds: [{ title: `Trade Between ${_trade[You.id].username} and ${_trade[Them.id].username}`, fields: createField(_trade) }], fetchReply: true });

            const collector = new InteractionCollector(msg.client, {
                channel: msg.channel,
                interactionType: InteractionType.ApplicationCommand, // ApplicationCommand
                filter: x => {
                    return x.commandName == "trade" && [You.id, Them.id].includes(BigInt(x.user.id));
                },
                time: 5 * 60000
            });

            const autoComplete = new InteractionCollector(msg.client, {
                channel: msg.channel,
                interactionType: InteractionType.ApplicationCommandAutocomplete,
                filter: x => {
                    return x.commandName == "trade" && [You.id, Them.id].includes(BigInt(x.user.id));
                },
                time: 3 * 60000
            });

            autoComplete.on("collect", async (interaction) => {
                let text = interaction.options.getFocused();

                let user_pokemon = (await msg.client.postgres`SELECT pokemon, s_hp, s_atk, s_def, s_spatk, s_spd, s_spdef, level, idx FROM pokemon WHERE user_id = ${interaction.user.id} AND pokemon LIKE ${text + "%"} LIMIT 20`);

                if (!user_pokemon[0]) return;

                interaction.respond(user_pokemon.map(e => {
                    return {
                        name: capitalize(e.pokemon) + " | Level: " + e.level + " | IV: " + (((e.s_hp + e.s_atk + e.s_def + e.s_spatk + e.s_spd + e.s_spdef) / 186) * 100).toFixed(2) + "%",
                        value: e.idx
                    }
                }).splice(0, 25));
            });

            autoComplete.on("end", () => { });

            let cancelled = false;
            let confirmed = false;

            collector.on("collect", async (m) => {
                // ID of user
                let id = BigInt(m.user.id);

                // Init User
                const user = id == You.id ? You : Them;

                // Trade Check
                let [trade_a, trade_b] = [await You.isTrading(msg.client.redis), await Them.isTrading(msg.client.redis)];

                // IF both users are not connected to each other, then reject them
                if (!(trade_a && trade_b && trade_a == Them.id.toString() && trade_b == You.id.toString()) || m.options.getSubcommand() == "cancel") {
                    // Assign Cancellation
                    cancelled = true;
                    // Stop Collector
                    return autoComplete.stop(), collector.stop(), true;
                };

                // Switch Case
                switch (m.options.getSubcommand()) {
                    case "add":
                    case "remove":
                        const isAdd = m.options.getSubcommand() == "add";

                        // Items
                        let [p, r, c, a] = [m.options.getInteger("pokemon"), m.options.getInteger("redeem"), m.options.getInteger("credit"), m.options.getString("mass")]

                        // Reject if nothing passed
                        if (!p && !r && !c && !a) return false;

                        // Clear off Confirmation
                        if (_trade[You.id].confirm || _trade[Them.id].confirm) _trade[You.id].confirm = _trade[Them.id].confirm = false;

                        // Redeems
                        if (r) {
                            if (isAdd) { _trade[id].r += r; } else { _trade[id].r -= r; }
                            if (_trade[id].r > user.redeem) _trade[id].r = user.redeem;
                            if (_trade[id].r < 0) _trade[id].r = 0;
                        }

                        // Credit
                        if (c) {
                            if (isAdd) { _trade[id].c += c; } else { _trade[id].c -= c; }
                            if (_trade[id].c > user.bal) _trade[id].c = user.bal;
                            if (_trade[id].c < 0) _trade[id].c = 0;
                        }

                        // Pokemon
                        if (p || a && (/\d/.test(a))) {
                            // Single Pokemon vs Mass
                            const list = p ? [p] : (a.match(/\d+/gmi).map(x => parseInt(x)) || []);

                            if (!list[0]) return false;

                            const pokemonFound = await msg.client.postgres`SELECT pokemon, idx, s_hp, s_atk, s_def, s_spdef, s_spatk, nature, level, s_spd, shiny, name, id FROM pokemon WHERE user_id = ${id} AND market = FALSE AND idx in ${msg.client.postgres(list)}`;

                            for (let pkIndex = 0; pkIndex < pokemonFound.length; pkIndex++) {
                                const pk = pokemonFound[pkIndex];
                                const checkPokemon = _trade[id].p.findIndex(x => x.id == pk.id);
                                if (isAdd && checkPokemon == -1) {
                                    _trade[id].p.push(pk);
                                }

                                if (!isAdd && checkPokemon != -1) {
                                    _trade[id].p.splice(checkPokemon, 1);
                                }
                            }
                        }

                        break;
                    case "confirm":
                        _trade[id].confirm = true;

                        if (_trade[You.id].confirm && _trade[Them.id].confirm) {
                            confirmed = true;
                            await m.reply({ ephemeral: true, content: "✅" })
                            return autoComplete.stop(), collector.stop(), true;
                        }
                        break;
                }

                // Edit Message
                await tradeMSG.edit({ embeds: [{ fields: createField(_trade), description: "~ trade slash commands enabled ~", title: `Trade Between ${msg.user.username} and ${Tradee.username}` }] });

                return m.reply({ ephemeral: true, content: "✅" });
            });

            collector.on("end", async (m) => {

                // Clear Trading
                await You.stopTrading(msg.client.redis);
                await Them.stopTrading(msg.client.redis);

                if (cancelled) return await msg.followUp("Trade was cancelled");

                if (confirmed) {

                    try {
                        let [{ max: maxPokemon1 }] = await msg.client.postgres`SELECT MAX(idx) as max FROM pokemon WHERE user_id = ${You.id};`
                        let [{ max: maxPokemon2 }] = await msg.client.postgres`SELECT MAX(idx) as max FROM pokemon WHERE user_id = ${Them.id};`

                        await msg.client.postgres.begin(sql => [
                            sql`UPDATE users SET bal = ${_trade[You.id].c} + bal - ${_trade[Them.id].c} , redeem = ${_trade[You.id].r} + redeem - ${_trade[Them.id].r} WHERE id = ${Them.id}`,
                            sql`UPDATE users SET bal = ${_trade[Them.id].c} + bal - ${_trade[You.id].c} , redeem = ${_trade[Them.id].r} + redeem - ${_trade[You.id].r} WHERE id = ${You.id}`,
                            ..._trade[Them.id].p.map(x => sql`UPDATE pokemon SET idx = ${++maxPokemon1}, user_id = ${You.id}, pokemon = ${evolvePokemon(x.pokemon)} WHERE id = ${x.id}`),
                            ..._trade[You.id].p.map(x => sql`UPDATE pokemon SET idx = ${++maxPokemon2}, user_id = ${Them.id}, pokemon = ${evolvePokemon(x.pokemon)} WHERE id = ${x.id}`)
                        ]);

                        return await msg.followUp(`Trade confirmed:
<@${You.id}> was willing to give up ${_trade[You.id].c || 0} credits, ${_trade[You.id].r || 0} redeems, and ${_trade[You.id].p.length} Pokemon.
<@${Them.id}> was willing to give up ${_trade[Them.id].c || 0} credits, ${_trade[Them.id].r || 0} redeems, and ${_trade[Them.id].p.length} Pokemon.`);
                    } catch (error) {
                        console.log(error);
                        return await msg.followUp("An Error occured... Please try again later.");
                    }
                }
                return await msg.followUp("Apparently nothing happened in time...");
            });
        }

        const cancelCommand = msg.options.getSubcommand() == "cancel";

        // Check if true
        if (cancelCommand) {
            // Return if User not Trading
            if (!(await You.isTrading(msg.client.redis))) return msg.reply("Cannot cancel when you are not trading");
            // Return if User is Trading
            return await You.stopTrading(msg.client.redis), msg.reply({ ephemeral: true, content: "✅" });
        }
    }
}
