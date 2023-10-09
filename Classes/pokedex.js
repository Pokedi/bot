import pokeapisql from "../Modules/Database/pokedb.js";
import { ENUM_POKEMON_BASE_STATS, POKEMON_NATURES, reverseENUM } from "../Utilities/Data/enums.js";
import Pokemon from "./pokemon.js";
import randomint from "../Utilities/Misc/randomint.js";
import { Chance } from "chance";
const chance = Chance();

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

    async fetchDBPokemonByID(id) {
        // Fetch from Dex
        const [pokemon] = this.pokedex.custom ? await pokeapisql`SELECT * FROM pokedi_v2_pokemon WHERE id = ${id || this.pokedex.id}` : await pokeapisql`SELECT * FROM pokemon_v2_pokemon WHERE id = ${id || this.pokedex.id}`;

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
        const [{ max: version_group_id }] = await pokeapisql.unsafe(`(SELECT MAX(version_group_id) as max FROM ${(this.pokedex.custom ? "pokedi" : "pokemon") + "_v2_pokemonmove"} WHERE pokemon_id = ${this.pokedex.id})`);

        // Return Moves
        this.pokedex.moves = await pokeapisql.unsafe(`SELECT pm.pokemon_id as pk, pm.version_group_id as vg, m.name as id_name, m.id as id, mlm.name as move_method, pm.level as level, mn.name as name, m.accuracy as move_accuracy, m.power as damage, m.priority as priority
        FROM ${(this.pokedex.custom ? "pokedi" : "pokemon") + "_v2_pokemonmove"} as pm
        JOIN   public.pokemon_v2_move as m ON ( m.id = pm.move_id)
        JOIN   public.pokemon_v2_versiongroup as vg ON ( vg.id = pm.version_group_id)
        JOIN   public.pokemon_v2_movelearnmethod as mlm ON (mlm.id = pm.move_learn_method_id)
        JOIN   public.pokemon_v2_movename as mn ON (mn.language_id = 9 AND mn.move_id = m.id)
        WHERE pm.pokemon_id = ${this.pokedex.id} AND pm.version_group_id = ${version_group_id} ORDER BY pm.level ASC;`)

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

    async searchForID(name) {
        // Check first DB
        let [row] = await pokeapisql`SELECT s.pokemon_species_id, p.name, s.name as pokemon_name FROM pokemon_v2_pokemonspeciesname as s INNER JOIN pokemon_v2_pokemon as p on (s.pokemon_species_id = p.pokemon_species_id) WHERE s.name ilike ${name} LIMIT 1`;

        if (row)
            return this.pokedex.id = row.pokemon_species_id,
                this.pokedex.name = row.pokemon_name,
                this.pokedex.name_id = row.name,
                this.pokemon = row.name,
                this.pokedex;

        // Check Second DB
        let [row2] = await pokeapisql`SELECT id, name FROM pokedi_v2_pokemon WHERE name ilike ${name}`;

        if (row2)
            return this.pokedex.custom = true,
                this.pokedex.id = row2.id,
                this.pokedex.name = row2.name,
                this.pokemon = row2.name,
                this.pokedex;

        return false;
    }

    async checkRarity() {
        // Reject if not valid
        if (!this.pokedex.id) return false;

        // Check Status
        const check = this.pokedex.custom ? await pokeapisql`SELECT * FROM pokedi_v2_pokemonrarity WHERE pokemon_id = ${this.pokedex.id}` : await pokeapisql`SELECT * FROM pokemon_v2_pokemonrarity WHERE pokemon_id = ${this.pokedex.id}`;

        // Assignment Rarity
        this.pokedex.rarity = check.map(x => x.rarity_id);

        // Return Rarity
        return this.pokedex.rarity;
    }

    async generateV2(id, mergingObject = {}) {
        // Select Randomly if nothing is specified
        if (!id && !this.pokemon && !this.pokedex?.id) {
            await this.selectRandomV2();
        };
        // Ready Base
        this.pokemon = this.pokemon.toLowerCase();
        this.level = randomint(60);
        this.stats = {
            hp: randomint() || 1,

            atk: randomint() || 1,
            def: randomint() || 1,

            spatk: randomint() || 1,
            spdef: randomint() || 1,

            spd: randomint() || 1
        };
        this.exp = 1;
        this.nature = Chance().pickone(POKEMON_NATURES)
        this.moves = Chance().shuffle(await this.getAvailableMovesV2()).splice(0, 4);
        this.types = await this.getTypesV2();
        this.rarity = await this.checkRarity();
        return Object.assign(this, mergingObject);
    }

    async selectRandomV2() {
        // Randomly Select Pokemon
        const [{ totalpokemon }] = await pokeapisql`SELECT MAX(id) as totalPokemon FROM pokemon_v2_pokemonspecies WHERE id < 10000`;

        // Find Row of Pokemon
        const [foundRow] = await pokeapisql`SELECT name, id FROM pokemon_v2_pokemonspecies WHERE id = ${randomint(totalpokemon)} LIMIT 1`;

        // Assign Pokemon _ID
        this.pokemon = foundRow.name;

        // Fix Pokedex
        this.pokedex.id = foundRow.id;

        return this.pokemon;
    }

    async SpawnFriendlyV2(forced) {
        // Ready Row
        const generatedPokemon = await this.generateV2();

        // Reject if cannot be generated
        if (!generatedPokemon) return false;

        if (!forced && (generatedPokemon.rarity.includes(6) || generatedPokemon.rarity.includes(4) && chance.d100() > 10)) return this.spawnFriendly();

        const findAltNames = this.pokedex.custom ? [] : await pokeapisql`SELECT name FROM pokemon_v2_pokemonspeciesname WHERE pokemon_species_id = ${this.pokedex.id}`;

        this.spawn_names = findAltNames.map(x => x.name);

        return generatedPokemon;
    }

    async getAvailableMovesV2() {
        if (!this.pokedex.id) return [];

        // Grab Last Version Group
        const [{ max: version_group_id }] = await pokeapisql.unsafe(`(SELECT MAX(version_group_id) as max FROM ${(this.pokedex.custom ? "pokedi" : "pokemon") + "_v2_pokemonmove"} WHERE pokemon_id = ${this.pokedex.id})`);

        // Return Array of MoveIDs
        return (this.pokedex.custom ? await pokeapisql`SELECT m.name FROM pokedi_v2_pokemonmove as p LEFT JOIN pokemon_v2_move as m ON (p.move_id = m.id) WHERE pokemon_id = ${this.pokedex.id} AND p.move_learn_method_id = 1 AND p.version_group_id = ${version_group_id} AND level <= ${this.level || 1}` : await pokeapisql`SELECT m.name FROM pokemon_v2_pokemonmove as p LEFT JOIN pokemon_v2_move as m ON (p.move_id = m.id) WHERE pokemon_id = ${this.pokedex.id} AND p.move_learn_method_id = 1 AND p.version_group_id = ${version_group_id} AND level <= ${this.level || 1}`).map(x => x.name);
    }

    async getTypesV2() {
        if (!this.pokedex.id) return [];

        return (await pokeapisql.unsafe(`SELECT t.name FROM ${(this.pokedex.custom ? "pokedi" : "pokemon") + "_v2_pokemontype"} LEFT JOIN pokemon_v2_type as t on (type_id = t.id ) WHERE pokemon_id = ${this.pokedex.id} ORDER BY slot ASC;`)).map(x => x.name);
    }

    async getStatsV2() {
        if (!this.pokedex.id || this.pokedex.custom) return [];

        return Object.assign(...(await pokeapisql.unsafe(`SELECT base_stat, s.name FROM ${(this.pokedex.custom ? "pokedi" : "pokemon") + "_v2_pokemonstat"} LEFT JOIN pokemon_v2_stat as s on (stat_id = s.id ) WHERE pokemon_id = ${this.pokedex.id};`)).map(x => ({ [reverseENUM(ENUM_POKEMON_BASE_STATS, x.name)]: x.base_stat })));
    }

    async getDescriptionV2() {
        if (!this.pokedex.id || this.pokedex.custom) return false;

        return await pokeapisql`SELECT * FROM public.pokemon_v2_pokemonspeciesflavortext WHERE pokemon_species_id = ${this.pokedex.id} AND language_id = 9 AND version_id = (SELECT MAX(version_id) FROM public.pokemon_v2_pokemonspeciesflavortext WHERE pokemon_species_id = ${this.pokedex.id} AND language_id = 9 LIMIT 1)`;
    }

    async getAltNamesV2() {
        if (!this.pokedex.id || this.pokedex.custom) return false;

        return await pokeapisql`SELECT p.name, iso3166 as flagcode FROM pokemon_v2_pokemonspeciesname as p LEFT JOIN pokemon_v2_language as l ON (p.language_id = l.id) WHERE pokemon_species_id = ${this.pokedex.id}`;
    }

    async getBasicInfoV2() {
        if (!this.pokedex.id || this.pokedex.custom) return false;

        return await pokeapisql`SELECT * FROM pokemon_v2_pokemonspecies as s LEFT JOIN pokemon_v2_pokemon as p ON (p.pokemon_species_id = s.id) WHERE s.id = ${this.pokedex.id} ORDER BY s.id ASC LIMIT 1`;
    }

    async getEvolutionV2() {
        if (!this.pokedex.id || this.pokedex.custom) return false;

        let evolutionChain = await this.getEvolutionFromSpeciesV2(this.pokedex.id, false);

        evolutionChain = evolutionChain.concat(await this.getEvolutionFromSpeciesV2(this.pokedex.id, true));

        if (evolutionChain.length && evolutionChain[0].evolved_from) {
            let id = evolutionChain[0].evolved_from;
            while (true) {
                const [foundPokemon] = await this.getEvolutionFromSpeciesV2(id, false);
                if (foundPokemon)
                    evolutionChain = evolutionChain.concat([foundPokemon]);
                if (!foundPokemon.evolved_from)
                    break;
                id = foundPokemon.evolved_from;
            }
        }

        return evolutionChain;
    }

    async getEvolutionFromSpeciesV2(id, from) {
        return await pokeapisql.unsafe(`SELECT s.id as pokemon_id, o.id, s.name, pre.name as evolved_from_name, o.evolves_from_species_id as evolved_from, p.min_level, p.min_happiness, p.min_affection, p.time_of_day, p.evolution_item_id, item.name as item_name, t.name as trigger, item.cost as item_price
        FROM pokemon_v2_pokemonspecies as s
        LEFT JOIN pokemon_v2_pokemonevolution as p on (p.evolved_species_id = s.id)
        LEFT JOIN pokemon_v2_pokemonspecies as o on (s.id = o.id)
        LEFT JOIN pokemon_v2_evolutiontrigger as t on (t.id = p.evolution_trigger_id)
        LEFT JOIN pokemon_v2_pokemonspecies as pre on (pre.id = o.evolves_from_species_id)
        LEFT JOIN pokemon_v2_item as item on (item.id = p.evolution_item_id)
        WHERE ${from ? "o.evolves_from_species_id" : "s.id"} = ${id || this.pokedex.id} AND p.location_id is null;`)
    }

    async getEvolutionFormsV2(name) {
        return await pokeapisql`SELECT id, name, pokemon_species_id, is_default FROM pokemon_v2_pokemonform WHERE name ilike ${name || this.pokedex.name_id}`;
    }

    async fetchDexData() {
        if (!this.pokedex.id) return;
        await this.checkRarity();
        this.pokedex.types = await this.getTypesV2();
        this.pokedex.stats = await this.getStatsV2();
        [this.pokedex.description] = await this.getDescriptionV2();
        this.pokedex.altNames = [];
        const altNames = await this.getAltNamesV2();
        for (const altName of altNames.reverse()) {
            if (!this.pokedex.altNames.find(x => x.flagcode == altName.flagcode || x.name == altName.name)) this.pokedex.altNames.push(altName);
        }
        const [basicInfo] = await this.getBasicInfoV2();
        this.pokedex = Object.assign(basicInfo, this.pokedex);
        this.pokedex.weight /= 10;
        this.pokedex.height /= 10;
        this.pokedex.evolution_chain = await this.getEvolutionV2();
        this.pokedex.forms = await this.getEvolutionFormsV2();
        return this.pokedex;
    }
}

export default Pokedex;