import pokeapisql from "../Modules/Database/pokedb.js";
import { ENUM_POKEMON_BASE_STATS, POKEMON_NATURES, reverseENUM, ENUM_POKEMON_TYPES_ID, ENUM_POKEMON_FULL_TYPES_ID } from "../Utilities/Data/enums.js";
import Pokemon from "./pokemon.js";
import randomint from "../Utilities/Misc/randomint.js";
import { Chance } from "chance";
import fusionPokemon from "../Utilities/Data/PokemonDB/fusions.json" assert {type: "json"};
import capitalize from "../Utilities/Misc/capitalize.js";
import builder from "../Modules/Database/QueryBuilder/queryGenerator.js";
import IVCalculator from "../Utilities/Pokemon/IVCalculator.js";
// import allPokemon from "../Utilities/Data/pokemon.js";

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

    async fetchByID(id) {
        // Check first DB
        let [row] = await pokeapisql`SELECT * FROM pokemon_dex WHERE _id = ${this.pokemon || id} LIMIT 1`;

        if (row)
            return this.pokedex = row,
                this.pokedex._id = this.pokedex._id.trim(),
                this.pokedex.name = this.pokedex.name.trim(),
                await this.getTypesV2(true),
                await this.getStatsV2(true),
                this.pokedex;

        return false;
    }

    async searchForID(name = this.pokemon) {
        // Check first DB
        let [row] = await pokeapisql`SELECT * FROM pokemon_dex WHERE name ilike ${'%' + (name) + '%'} OR _id ilike ${'%' + (name) + '%'} OR _id ilike ${'%' + (name.replace(/ /gmi, '-')) + '%'} LIMIT 1`;

        if (row)
            return this.pokedex = row,
                this.pokedex._id = this.pokedex._id.trim(),
                this.pokedex.name = this.pokedex.name.trim(),
                await this.getTypesV2(true),
                this.pokedex;

        return false;
    }

    async generateV2(id, mergingObject = {}) {
        // Select Randomly if nothing is specified
        if (!id && !this.pokemon && !this.pokedex?.id) {
            await this.selectRandomV2();
        };
        // Ready Base
        this.pokemon = (this.pokemon || this.pokedex._id).toLowerCase();
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
        this.nature = Chance().pickone(POKEMON_NATURES);
        this.moves = Chance().shuffle(await this.getAvailableMovesV2()).splice(0, 4);
        this.gender = this.determineGender();
        return Object.assign(this, mergingObject);
    }

    determineGender(ratio = this.pokedex.gender_rate = 4) {
        if (ratio == -1) return 3;

        return (ratio <= Chance().d8()) ? 1 : 2;
    }

    async selectRandomV2() {
        // Randomly Select Pokemon
        const [{ totalpokemon }] = await pokeapisql`SELECT MAX(id) as totalPokemon FROM pokemon_dex WHERE id < 10000`;

        // Find Row of Pokemon
        const [foundRow] = await pokeapisql`SELECT name, id, gender_rate FROM pokemon_dex WHERE id = ${randomint(totalpokemon)} LIMIT 1`;

        // Assign Pokemon _ID
        this.pokemon = foundRow.name;

        // Fix Pokedex
        this.pokedex.id = foundRow.id;

        // Gender Rate
        this.pokedex.gender_rate = foundRow.gender_rate;

        return this.pokemon;
    }

    async SpawnFriendlyV2(forced) {
        // Ready Row
        const generatedPokemon = await this.generateV2();

        // Reject if cannot be generated
        if (!generatedPokemon) return false;

        if (!forced && (generatedPokemon.is_nonspawnable || (generatedPokemon.is_legendary || generatedPokemon.is_sublegendary || generatedPokemon.is_mythical) && chance.d100() > 10)) return this.spawnFriendly();

        const findAltNames = this.pokedex.custom ? [] : await pokeapisql`SELECT name FROM pokemon_v2_pokemonspeciesname WHERE pokemon_species_id = ${this.pokedex.id}`;

        this.spawn_names = [this.pokedex.name].concat(findAltNames.map(x => x.name)).filter(x => x);

        return generatedPokemon;
    }

    async getAvailableMovesV2() {
        if (!this.pokedex.id) return [];

        // Grab Last Version Group
        const [{ max: version_group_id }] = await pokeapisql.unsafe(`(SELECT MAX(version_group_id) as max FROM ${(this.pokedex.custom ? "pokedi" : "pokemon") + "_v2_pokemonmove"} WHERE pokemon_id = ${this.pokedex.id})`);

        // Return Array of MoveIDs
        return (this.pokedex.custom ? await pokeapisql`SELECT m.name FROM pokedi_v2_pokemonmove as p LEFT JOIN pokemon_v2_move as m ON (p.move_id = m.id) WHERE pokemon_id = ${this.pokedex.id} AND p.move_learn_method_id = 1 AND p.version_group_id = ${version_group_id} AND level <= ${this.level || 1}` : await pokeapisql`SELECT m.name FROM pokemon_v2_pokemonmove as p LEFT JOIN pokemon_v2_move as m ON (p.move_id = m.id) WHERE pokemon_id = ${this.pokedex.id} AND p.move_learn_method_id = 1 AND p.version_group_id = ${version_group_id} AND level <= ${this.level || 1}`).map(x => x.name);
    }

    async getColumnsByID(columns = "id, types, hp, atk, def, spatk, spdef, spd") {
        const { text, values } = builder.select("pokemon_dex", columns);

        let [row] = await pokeapisql.unsafe(text, values);

        if (!row) return false;

        this.pokedex = Object.assign(this.pokedex, row);

        return this.pokedex;
    }

    async getTypesV2(fallBack) {
        if (!this.pokedex.id || this.types?.length) return [];

        const info = this.custom ? this.types : this.pokedex.types;

        if (!fallBack) return info;

        this.pokedex.types = info.map(x => ENUM_POKEMON_FULL_TYPES_ID[x]);

        this.types = info.map(x => ENUM_POKEMON_TYPES_ID[x]);

        return this.pokedex.types;
    }

    calculateIV(type = "hp") {
        return IVCalculator(this.pokedex.stats[type], this.stats[type], this.level, type, this.nature);
    }

    calculatedStats() {
        return {
            hp: this.calculateIV("hp"),
            atk: this.calculateIV("atk"),
            def: this.calculateIV("def"),
            spatk: this.calculateIV("spatk"),
            spdef: this.calculateIV("spdef"),
            spd: this.calculateIV("spd")
        };
    }

    async getStatsV2(fallBack) {
        if (!this.pokedex.id || this.pokedex.custom) return [];

        const info = {
            hp: this.pokedex.hp,
            atk: this.pokedex.atk,
            def: this.pokedex.def,
            spatk: this.pokedex.spatk,
            spdef: this.pokedex.spdef,
            spd: this.pokedex.spd
        };

        if (!fallBack) return info;

        this.pokedex.stats = info;

        return this.pokedex.stats;
    }

    async getDescriptionV2() {
        if (!this.pokedex.id || this.pokedex.custom) return false;

        return await pokeapisql`SELECT * FROM public.pokemon_v2_pokemonspeciesflavortext WHERE pokemon_species_id = ${this.pokedex.id} AND language_id = 9 AND version_id = (SELECT MAX(version_id) FROM public.pokemon_v2_pokemonspeciesflavortext WHERE pokemon_species_id = ${this.pokedex.id} AND language_id = 9 LIMIT 1)`;
    }

    async getAltNamesV2() {
        if (!this.pokedex.id || this.pokedex.custom) return false;

        return await pokeapisql`SELECT p.name, iso3166 as flagcode FROM pokemon_v2_pokemonspeciesname as p LEFT JOIN pokemon_v2_language as l ON (p.language_id = l.id) WHERE pokemon_species_id = ${this.pokedex.id}`;
    }

    async getBasicInfoV2(fallBack) {
        if (!this.pokedex.id || this.pokedex.custom) return false;

        const info = await pokeapisql`SELECT * FROM pokemon_v2_pokemonspecies as s LEFT JOIN pokemon_v2_pokemon as p ON (p.pokemon_species_id = s.id) WHERE s.id = ${this.pokedex.id} ORDER BY s.id ASC LIMIT 1`;

        if (!fallBack) return info;

        this.pokedex = Object.assign(info[0], this.pokedex);

        return this.pokedex;
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
        return await pokeapisql.unsafe(`SELECT s.id as pokemon_id, o.id, s.name, pre.name as evolved_from_name, o.evolves_from_species_id as evolved_from, p.min_level, p.min_happiness, p.min_affection, p.time_of_day, p.evolution_item_id, item.name as item_name, t.name as trigger, item.cost as item_price, trade_evo.name as trade_pokemon
        FROM pokemon_dex as s
        LEFT JOIN pokemon_v2_pokemonevolution as p on (p.evolved_species_id = s.id)
        LEFT JOIN pokemon_dex as o on (s.id = o.id)
        LEFT JOIN pokemon_v2_evolutiontrigger as t on (t.id = p.evolution_trigger_id)
        LEFT JOIN pokemon_dex as trade_evo on p.trade_species_id = trade_evo.id
        LEFT JOIN pokemon_dex as pre on (pre.id = o.evolves_from_species_id)
        LEFT JOIN pokemon_v2_item as item on (item.id = p.evolution_item_id)
        WHERE ${from ? "o.evolves_from_species_id" : "s.id"} = ${id || this.pokedex.id} AND p.location_id is null;`)
    }

    async getEvolutionFormsV2(name) {
        return await pokeapisql`SELECT id, name, _id FROM pokemon_dex WHERE name ilike ${'%' + (name || this.pokedex._id) + '%'} AND _id != ${(name || this.pokedex._id)}`;
    }

    async getFusionsV2() {
        return fusionPokemon.filter(x => x.first_pokemon == this.pokedex._id || x.second_pokemon == this.pokedex._id);
    }

    async fetchDexData() {
        if (!this.pokedex.id) return;

        await this.getTypesV2(true);

        await this.getStatsV2(true);

        [this.pokedex.description] = await this.getDescriptionV2();
        this.pokedex.altNames = [];

        const altNames = await this.getAltNamesV2();
        for (const altName of altNames.reverse()) {
            if (!this.pokedex.altNames.find(x => x.flagcode == altName.flagcode || x.name == altName.name)) this.pokedex.altNames.push(altName);
        }

        this.pokedex.weight /= 10;
        this.pokedex.height /= 10;

        this.pokedex.evolution_chain = await this.getEvolutionV2();

        this.pokedex.forms = await this.getEvolutionFormsV2();

        this.pokedex.fusions = this.getFusionsV2();

        return this.pokedex;
    }

    async basicInfo() {

    }
}

export default Pokedex;