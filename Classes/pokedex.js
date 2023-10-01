import pokeapisql from "../Modules/Database/pokedb.js";
import Pokemon from "./pokemon.js";

class Pokedex extends Pokemon {
    constructor(obj = {}) {
        super(obj);
        this.pokedex = {
            moves: [],
            move_prices: []
        }
    }

    async fetchDBPokemon() {
        // Fetch from Dex
        const [pokemon] = await pokeapisql`SELECT * FROM public.pokemon_v2_pokemon WHERE name = ${this.pokemon}`;

        // Give to Dex
        this.pokedex = pokemon;

        // Return
        return this.pokedex;
    }

    async fetchAllMoves() {
        // Grab DBPokemon
        if (!this.pokedex.name) await this.fetchDBPokemon();
        // Reject if not found
        if (!this.pokedex) return [];

        // Grab Last Version Group
        const [{ max: version_group_id }] = await pokeapisql`(SELECT MAX(version_group_id) as max FROM pokemon_v2_pokemonmove WHERE pokemon_id = ${this.pokedex.id})`;

        // Return Moves
        this.pokedex.moves = await pokeapisql`SELECT pm.pokemon_id as pk, pm.version_group_id as vg, m.name as id_name, m.id as id, mlm.name as move_method, pm.level as level, mn.name as name, m.accuracy as move_accuracy, m.power as damage, m.priority as priority
        FROM public.pokemon_v2_pokemonmove as pm
        JOIN   public.pokemon_v2_move as m ON ( m.id = pm.move_id)
        JOIN   public.pokemon_v2_versiongroup as vg ON ( vg.id = pm.version_group_id)
        JOIN   public.pokemon_v2_movelearnmethod as mlm ON (mlm.id = pm.move_learn_method_id)
        JOIN   public.pokemon_v2_movename as mn ON (mn.language_id = 9 AND mn.move_id = m.id)
        WHERE pm.pokemon_id = ${this.pokedex.id} AND pm.version_group_id = ${version_group_id} ORDER BY pm.level ASC;`

        return this.pokedex.moves;
    }

    async fetchTMPrices() {
        // Grab DBPokemon
        if (!this.pokedex.moves) await this.fetchAllMoves();
        // Reject if not found
        if (!this.pokedex) return [];

        this.pokedex.move_prices = await pokeapisql`SELECT * FROM pokemon_v2_machine as ma
JOIN   public.pokemon_v2_item as i ON (ma.item_id = i.id)
WHERE move_id in ${pokeapisql(this.pokedex.moves.filter(x => x.move_method == "machine").map(x => x.id))} ORDER BY version_group_id DESC;`;

        return this.pokedex.move_prices;
    }
}

export default Pokedex;