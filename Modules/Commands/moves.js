import { SlashCommandBuilder } from "discord.js";
import Player from "../../Classes/player.js";
import Pokemon from "../../Classes/pokemon.js";
import capitalize from "../../Utilities/Misc/capitalize.js";
import moves from "../../Utilities/Data/moves.json" assert {type: "json"};
import Color from "color";

function separateArray(array, chunkSize) {
    var result = [];
    for (var i = 0; i < array.length; i += chunkSize) {
        var chunk = array.slice(i, i + chunkSize);
        result.push(chunk);
    }
    return result;
}

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('moves')
        .setDescription('View possible and set Pokemon moves')
        .addIntegerOption(x => x
            .setName("move-id")
            .setDescription("ID of the Move you wish to set or view")
        )
        .addIntegerOption(x => x
            .setName("move-slot")
            .setDescription("The slot in which you wish to replace the move")
            .setMaxValue(4)
            .setMinValue(1)
        ),
    async execute(msg) {

        const player = new Player({ id: msg.user.id });

        await player.fetch(msg.client.postgres);

        if (!player.started) return await msg.reply("You have not started your journey...");

        if (!player.selected.length) return await msg.reply("You do not have a Pokemon selected...");

        const pokemon = new Pokemon({ id: player.selected[0] });

        // Fetch Pokemon
        await pokemon.fetchPokemon(msg.client.postgres);

        // Get Pokemon's Moves
        const moves = pokemon.returnMoves();

        // Retrieve Level Moves
        const availableMoves = pokemon.getDetails().moves;

        // Retrieve TM moves
        const tmAvailableMoves = pokemon.getDetails().tm;

        await msg.reply({
            embeds: [
                // Current Moves Embed
                {
                    color: Color("#ffeb3b").rgbNumber(),
                    title: `Current Moves of your Level ${pokemon.level} ${capitalize(pokemon.pokemon)}`,
                    description: `In order to set a move, please \`/moves <move-id> <move-slot>\``,
                    fields: [{
                        name: "Current Moves",
                        value: moves.map((x, i) => `**Move ${i + 1}**: ${capitalize(x.name.replace(/-/gim, " "))}\n`).join(""),
                        inline: false
                    }],
                },
                // Level Moves Embed
                {
                    color: Color("#3f50b5").rgbNumber(),
                    title: `Level-Based moves for your Level ${pokemon.level} ${capitalize(pokemon.pokemon)}`,
                    description: `In order to set a move, please \`/moves <move-id> <move-slot>\``,
                    fields:
                        // Available Moves - By Leveling Up
                        availableMoves && Object.keys(availableMoves).length ? separateArray(Object.entries(availableMoves), 20).map(x => ({
                            name: "Available Moves",
                            inline: true,
                            value: x.map(y => capitalize(y[0].replace(/-/gim, " ")) + ` (LvL: ${availableMoves[y[0]]}+)${moves[y[0]] && moves[y[0]].s == 'st' ? " [𝔰𝔱𝔞𝔱𝔲𝔰]" : ""}\n`).join("")
                        })) : [{
                            name: "Available Moves",
                            inline: true,
                            value: "-- None --"
                        }]
                    ,
                },
                // TM Moves Embed
                {
                    color: Color('#f44336').rgbNumber(),
                    title: `TM Moves for your Level ${pokemon.level} ${capitalize(pokemon.pokemon)}`,
                    description: `In order to set a move, please \`/moves <move-id> <move-slot>\``,
                    fields: [                    // Available Moves - By TMs
                        ...(tmAvailableMoves && Object.keys(tmAvailableMoves).length ? separateArray(Object.entries(tmAvailableMoves), 20).map(x => ({
                            name: "Available TM Moves",
                            inline: true,
                            value: x.map(y => capitalize(y[0].replace(/-/gim, " ")) + ` (LvL: ${tmAvailableMoves[y[0]]}+)${moves[y[0]] && moves[y[0]].s == 'st' ? " [𝔰𝔱𝔞𝔱𝔲𝔰]" : ""}\n`).join("")
                        })) : [{
                            name: "Available TM Moves",
                            inline: true,
                            value: "-- None --"
                        }])
                    ]
                }]
        });
    }
}
