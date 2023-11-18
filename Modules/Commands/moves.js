import { SlashCommandBuilder } from "discord.js";
import Player from "../../Classes/player.js";
import capitalize from "../../Utilities/Misc/capitalize.js";
import Color from "color";
import Pokedex from "../../Classes/pokedex.js";
import separateArray from "../../Utilities/Misc/separateArray.js";
import Move from "../../Classes/move.js";
import { ENUM_TYPE_COLORS } from "../../Utilities/Data/enums.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('moves')
        .setDescription('View possible and set Pokemon moves')
        .addSubcommand(y => y
            .setName("info")
            .setDescription("Check up information on moves!")
            .addIntegerOption(x => x
                .setName("move-info")
                .setDescription("Get information on the Move you selected")
                .setAutocomplete(true)
            )
            .addIntegerOption(x => x
                .setName('pokemon-slot')
                .setDescription("Select the Pokemon you want to check [Default: 1]")
                .setMaxValue(6)
                .setMinValue(1)
            )
            .addBooleanOption(x => x
                .setName("level-moves")
                .setDescription("Show Moves you can gain through leveling up your Pokemon")
            )
            .addBooleanOption(x => x
                .setName("tm-moves")
                .setDescription("Show Moves you can gain through buying Technical-Machines for your Pokemon")
            )
        )
        .addSubcommand(y => y
            .setName("store")
            .setDescription("Set or Buy moves to train your Pokemon!")
            .addIntegerOption(x => x
                .setName("move-id")
                .setDescription("ID of the Move you wish to set or view")
                .setAutocomplete(true)
            )
            .addIntegerOption(x => x
                .setName("tm-id")
                .setDescription("ID of the TM Move you wish to set or view")
                .setAutocomplete(true)
            )
            .addIntegerOption(x => x
                .setName("move-slot")
                .setDescription("The slot in which you wish to replace the move")
                .setMaxValue(4)
                .setMinValue(1)
            )
            .addIntegerOption(x => x
                .setName('pokemon-slot')
                .setDescription("Select the Pokemon you want to set a move for [Default: 1]")
                .setMaxValue(6)
                .setMinValue(1)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName("help").setDescription("Check out how to use the Market Command and apparently abandon what you gained trust of!")
        ),
    async execute(msg) {

        // Redirect to Help if called
        if (msg.options.getSubcommand() == "help")
            return msg.options._hoistedOptions.push({ name: "command_name", type: 3, value: "moves" }),
                msg.client.commands.get("help")(msg);

        // Check Move Info ID
        const moveInfoID = msg.options.getInteger("move-info");

        // For Move Info
        if (moveInfoID) {
            // Ready Move Class
            const foundMove = new Move({ id: moveInfoID });
            // Fetch Data
            await foundMove.fetch();
            return msg.reply({
                embeds: [{
                    color: ENUM_TYPE_COLORS[capitalize(foundMove.type)],
                    title: `Information on ${foundMove.name} || ID: ${foundMove.id}`,
                    description: foundMove.meta.description,
                    fields: [{
                        name: "Type",
                        value: capitalize(foundMove.type),
                        inline: true
                    }, {
                        name: "Damage",
                        value: foundMove.power || "No Damage",
                        inline: true
                    }, {
                        name: "Accuracy",
                        value: foundMove.accuracy || "---",
                        inline: true
                    }, {
                        name: "Damage Type",
                        value: foundMove.damage_type,
                        inline: true
                    }, {
                        name: "Status Effect",
                        value: foundMove.meta.ailment ? `${capitalize(foundMove.meta.ailment)} (${foundMove.meta.ailment_chance || 100}%)` : "No Status Effect",
                        inline: true
                    }, {
                        name: "TM Cost",
                        value: foundMove.cost ? foundMove.cost.toLocaleString() : "---",
                        inline: true
                    }]
                }]
            });
        }

        const player = new Player({ id: msg.user.id, /* guild_id: msg.guild.info.mode ? msg.guild.id : null */ });

        const pokemonSlot = (msg.options.getInteger("pokemon-slot") || 1) - 1;

        await player.fetch(msg.client.postgres);

        if (!player.started) return await msg.reply("You have not started your journey...");

        // Only allow if selected pokemon exists
        if (!player.selected.length || !player.selected[pokemonSlot]) return await msg.reply("You do not have a Pokemon selected...");

        // Fetch Pokemon
        const pokemon = new Pokedex({ id: player.selected[pokemonSlot] });

        // Fetch Pokemon
        await pokemon.fetchPokemon(msg.client.postgres);

        // MoveID
        const moveID = msg.options.getInteger("move-id");

        // TM-ID
        const TMID = msg.options.getInteger("tm-id");

        // MoveSlot
        const moveSlot = msg.options.getInteger("move-slot");

        // Get Pokemon's Moves
        const moves = pokemon.returnMoves();

        // Grab All Moves
        const allMoves = await pokemon.fetchAllMoves();

        // Retrieve Level Moves
        const availableMoves = allMoves.filter(x => x.move_method == "level-up");

        // Retrieve TM moves
        const tmAvailableMoves = allMoves.filter(x => x.move_method == "machine");

        // Retrieve TM prices
        await pokemon.fetchTMPrices();

        // For Level-Moves 
        if (moveSlot && moveID) {
            // Find Move
            const selectedMove = availableMoves.find(x => x.id == moveID);
            // Return Non-Existent Move
            if (!selectedMove) return await msg.reply("Cannot learn that...");
            // Disallow if Level does not allow
            if (selectedMove.level && pokemon.level < selectedMove.level) return await msg.reply("Your pokemon needs to be at least Level " + selectedMove.level + " to learn that move...");
            // Apply Move
            pokemon.save(msg.client.postgres, { ["m_" + moveSlot]: selectedMove.id_name });
            // Output
            return await msg.reply(`Your ${capitalize(pokemon.pokemon)} successfully learnt ${selectedMove.name}!`);
        }

        // For TM-Moves 
        if (moveSlot && TMID) {
            // Find Move
            const selectedMove = tmAvailableMoves.find(x => x.id == TMID);
            // Return Non-Existent Move
            if (!selectedMove) return await msg.reply("Cannot learn that...");
            // Find Cost
            const cost = pokemon.pokedex.move_prices.find(h => h.move_id == TMID).cost || 0;
            // Disallow if Level does not allow
            if (cost && cost > player.bal) return await msg.reply("You do not have enough funds for that move...");
            // Apply Move
            await pokemon.save(msg.client.postgres, { ["m_" + moveSlot]: selectedMove.id_name });
            // Reduce Player's Bal
            await player.save(msg.client.postgres, { bal: player.bal - cost });
            // Output
            return await msg.reply(`Your ${capitalize(pokemon.pokemon)} successfully learnt ${selectedMove.name}! ${cost.toLocaleString()} pokedits were deducted from your balance.`);
        }

        await msg.reply({
            embeds: [
                // Current Moves Embed
                {
                    color: Color("#ffeb3b").rgbNumber(),
                    title: `Current Moves of your Level ${pokemon.level} ${capitalize(pokemon.pokemon)}`,
                    description: `In order to set a move, please \`/moves store <move-id> <move-slot>\` and to check the available moves, use \`/moves info level-moves:true\``,
                    fields: [{
                        name: "Current Moves",
                        value: moves.map((x, i) => `**Move ${i + 1}**: ${capitalize(x.name.replace(/-/gim, " "))}\n`).join(""),
                        inline: false
                    }],
                    // Adding Professor Kukui
                    author: {
                        icon_url: "https://cdn.discordapp.com/attachments/738221731897933844/786154409498378270/Cutie.png",
                        name: `Professor Kukui`
                    }
                },
                // Level Moves Embed
                msg.options.getBoolean("level-moves") ? {
                    color: Color("#3f50b5").rgbNumber(),
                    title: `Level-Based moves for your Level ${pokemon.level} ${capitalize(pokemon.pokemon)}`,
                    description: `In order to set a move, please \`/moves store <move-id> <move-slot>\` and to check the available moves, use \`/moves info level-moves:true\``,
                    fields:
                        // Available Moves - By Leveling Up
                        availableMoves ? separateArray(availableMoves, 20).map(x => ({
                            name: "Available Moves",
                            inline: true,
                            value: x.map(y => y.name + ` | **Lvl**: ${y.level}+ | **ID**: \`${y.id}\`\n`).join("")
                        })) : [{
                            name: "Available Moves",
                            inline: true,
                            value: "-- None --"
                        }],
                    // Adding Professor Kukui
                    author: {
                        icon_url: "https://cdn.discordapp.com/attachments/738221731897933844/786154409498378270/Cutie.png",
                        name: `Professor Kukui`
                    }
                } : undefined,
                // TM Moves Embed
                msg.options.getBoolean("tm-moves") ? {
                    color: Color('#f44336').rgbNumber(),
                    title: `TM Moves for your Level ${pokemon.level} ${capitalize(pokemon.pokemon)}`,
                    description: `In order to set a move, please \`/moves store <move-id> <move-slot>\` and to check the available moves, use \`/moves info level-moves:true\``,
                    fields: [                    // Available Moves - By TMs
                        ...(tmAvailableMoves ? separateArray(tmAvailableMoves, 20).map(x => ({
                            name: "Available TM Moves",
                            inline: true,
                            value: x.map(y => y.name + ` | **Cost**: \`${(pokemon.pokedex.move_prices.find(h => h.move_id == y.id)?.cost || 0).toLocaleString()}\` | **ID**: \`${y.id}\`\n`).join("")
                        })) : [{
                            name: "Available TM Moves",
                            inline: true,
                            value: "-- None --"
                        }])
                    ],
                    // Adding Professor Kukui
                    author: {
                        icon_url: "https://cdn.discordapp.com/attachments/738221731897933844/786154409498378270/Cutie.png",
                        name: `Professor Kukui`
                    }
                } : undefined
            ].filter(x => x)
        });
    }
}
