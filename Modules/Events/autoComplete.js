import Player from "../../Classes/player.js";
import Pokedex from "../../Classes/pokedex.js";
import capitalize from "../../Utilities/Misc/capitalize.js";
import pokeapisql from "../Database/pokedb.js";

export default async (interaction) => {

    if (interaction.commandName == "moves") {

        let text = interaction.options.getFocused();

        let moves = (await pokeapisql`SELECT * FROM pokemon_v2_movename
        WHERE name ILIKE ${text + "%"} AND language_id = 9 LIMIT 20`);

        if (!moves[0]) return;

        interaction.respond(moves.map(e => {
            return {
                name: `${e.name} || ID: ${e.move_id}`,
                value: e.move_id
            }
        }).splice(0, 25))
    }

    if (interaction.commandName == "shop") {

        const player = new Player(interaction.user);

        if (!(await player.fetchColumns(interaction.client.postgres, 'id, started, selected, bal')))
            return;

        const pokeID = interaction.options.getInteger('id');

        let selectedPokemon = new Pokedex(pokeID ? { idx: pokeID, user_id: interaction.user.id } : { id: player.selected[0] });

        await selectedPokemon.fetchPokemonByIDX(interaction.client.postgres, "id, pokemon");

        await selectedPokemon.fetchByID();

        const itemEvolution = await selectedPokemon.getItemEvolutionsV2();

        if (itemEvolution.length)
            interaction.respond(itemEvolution.map(e => {
                return {
                    name: `${player.bal < e.cost ? "❎" : "✅"} || ${capitalize(e.name, true)} || ${capitalize(e._id)} || Cost: ${e.cost}`,
                    value: e.evoid
                }
            }).splice(0, 25));
    }

    return;
}