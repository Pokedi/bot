import Player from "../../Classes/player.js";
import Pokedex from "../../Classes/pokedex.js";
import capitalize from "../../Utilities/Misc/capitalize.js";
import removeDuplicates from "../../Utilities/Misc/removeDuplicates.js";
import pokeapisql from "../Database/pokedb.js";

export default async (interaction) => {

    if (interaction.commandName == "moves") {

        let text = interaction.options.getFocused();

        let moves = (await pokeapisql`SELECT name, move_id FROM pokemon_v2_movename
        WHERE name ILIKE ${text + "%"} LIMIT 20`);

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

        const possibleOverrides = itemEvolution.length && itemEvolution.filter(x => x.evolution_item_id).length ? await interaction.client.postgres`SELECT id, cost FROM product WHERE id in ${interaction.client.postgres(itemEvolution.map(x => x.evolution_item_id))}` : [];

        if (itemEvolution.length)
            interaction.respond(itemEvolution.map(e => {

                const cost = possibleOverrides.find(x => x.id == e.evolution_item_id)?.cost || e.cost;
                
                return {
                    name: `${player.bal < e.cost ? "❎" : "✅"} || ${capitalize(e.name, true)} || ${capitalize(e._id)} || Cost: ${cost}`,
                    value: e.evoid
                }
            }).splice(0, 25));
    }

    if (interaction.commandName == "inventory") {
        let text = interaction.options.getFocused();

        if (!text)
            return;

        const items = await pokeapisql`SELECT DISTINCT ON (pokemon_v2_itemname.name) name, item_id FROM pokemon_v2_itemname WHERE name ilike ${'%' + text + '%'} LIMIT 25`;

        if (!items.length)
            return;

        return interaction.respond(removeDuplicates(items).map(x => ({
            name: x.name + " #" + x.item_id,
            value: x.item_id
        })))
    }

    return;
}