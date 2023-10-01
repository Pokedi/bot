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

    return;
}