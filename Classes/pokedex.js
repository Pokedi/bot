import pokeapisql from "../Modules/Database/pokedb.js";
import { POKEMON_NATURES, ENUM_POKEMON_TYPES_ID } from "../Utilities/Data/enums.js";
import Pokemon from "./pokemon.js";
import randomint from "../Utilities/Misc/randomint.js";
import { Chance } from "chance";
import fusionPokemon from "../Utilities/Data/PokemonDB/fusions.json" with {type: "json"};
// import capitalize from "../Utilities/Misc/capitalize.js";
// import builder from "../Modules/Database/QueryBuilder/queryGenerator.js";
import IVCalculator from "../Utilities/Pokemon/IVCalculator.js";
import { readySinglePokemonFrontBack } from "../Utilities/Pokemon/pokemonBattleImage.js";
import calculateNextLevelEXP from "../Utilities/Pokemon/calculateNextLevelEXP.js";
import getTime from "../Utilities/Misc/getTime.js";
import { Moon } from "lunarphase-js";
import MiniSearch from "minisearch";

let possiblePokemon; // Gotta initialize this asynchronously

async function initializeMiniSearch() {

    let pokemonNames = await pokeapisql`SELECT id, name FROM pokemon_v2_pokemon`;

    possiblePokemon = new MiniSearch({
        fields: ["id", "name"],
        storeFields: ["id"],
        searchOptions: {
            fuzzy: 0.4
        }
    });

    // console.log(pokemonNames.splice(0, 5), "possiblePokemon");

    possiblePokemon.addAll(pokemonNames.map(x => ({ id: x.id, name: x.name.replace(/-/gmi, ' ') })));

}

initializeMiniSearch().catch(err => { console.error("Failed to initialize MiniSearch", err) });

class Pokedex extends Pokemon {

    constructor(obj = {}) {
        super(obj);
        this.pokedex = {
            name: null,
            moves: [],
            move_prices: []
        }
    }

    async getPokemonSpecies(identifier) {

        if (!identifier && this.pokemon) return this.getPokemonSpecies(this.pokemon);

        let pokemonRow = null;

        if (!possiblePokemon) {
            await initializeMiniSearch();
        }

        const basePokemonQuery = (condition, value) => pokeapisql`
            SELECT
                p.id,
                p.name AS _id, -- Use name as _id (slug) for consistency
                p.name AS name,
                p.height,
                p.weight,
                p.base_experience,
                ps.gender_rate,
                ps.capture_rate,
                ps.base_happiness,
                ps.is_baby,
                ps.hatch_counter,
                ps.forms_switchable,
                ps.has_gender_differences,
                ps.evolves_from_species_id,
                stats.spd,
                stats.hp,
                stats.def,
                stats.atk,
                stats.spdef,
                stats.spatk,
                stats.eva,
                stats.acc,
                NULL::integer AS acc, -- Placeholder if not available in current schema
                NULL::integer AS eva, -- Placeholder if not available in current schema
                types.types,
                ps.pokemon_color_id,
                ps.pokemon_shape_id,
                ps.growth_rate_id,
                ps.pokemon_habitat_id,
                ps.is_mythical,
                ps.is_legendary,
                FALSE AS is_sub_legendary, -- Set explicitly as false based on schema mapping
                FALSE AS is_custom,        -- Set explicitly as false
                FALSE AS is_nonspawnable,  -- Set explicitly as false
                FALSE AS is_event,         -- Set explicitly as false
                NULL::text AS art,         -- Placeholder for art URL
                p.id AS dexid
            FROM pokemon_v2_pokemon p
            JOIN pokemon_v2_pokemonspecies ps ON ps.id = p.pokemon_species_id
            -- Subquery for stats
            LEFT JOIN (
                SELECT
                    s.pokemon_id,
                    MAX(CASE WHEN s.stat_id = 4 THEN s.base_stat END) AS spd, -- Speed
                    MAX(CASE WHEN s.stat_id = 1 THEN s.base_stat END) AS hp,  -- HP
                    MAX(CASE WHEN s.stat_id = 3 THEN s.base_stat END) AS def, -- Defense
                    MAX(CASE WHEN s.stat_id = 2 THEN s.base_stat END) AS atk, -- Attack
                    MAX(CASE WHEN s.stat_id = 6 THEN s.base_stat END) AS spdef, -- Special Defense
                    MAX(CASE WHEN s.stat_id = 5 THEN s.base_stat END) AS spatk, -- Special Attack
                    MAX(CASE WHEN s.stat_id = 7 THEN s.base_stat END) AS acc, -- Accuracy
                    MAX(CASE WHEN s.stat_id = 8 THEN s.base_stat END) AS eva -- Evasion
                FROM pokemon_v2_pokemonstat s
                GROUP BY s.pokemon_id
            ) stats ON stats.pokemon_id = p.id
            -- Subquery for types with names
            LEFT JOIN (
                SELECT
                    pt_sub.pokemon_id,
                    ARRAY_AGG(t.name ORDER BY pt_sub.slot) AS types
                FROM (
                    SELECT DISTINCT ON (pt.pokemon_id, pt.type_id)
                        pt.pokemon_id, pt.type_id, pt.slot
                    FROM pokemon_v2_pokemontype pt
                    ORDER BY pt.pokemon_id, pt.type_id, pt.slot
                ) pt_sub
                JOIN pokemon_v2_type t ON t.id = pt_sub.type_id
                GROUP BY pt_sub.pokemon_id
            ) types ON types.pokemon_id = p.id
            WHERE ${pokeapisql(condition)} = ${value} LIMIT 1
        `;

        if (typeof identifier === 'number' || (typeof identifier === 'string' && /^\d+$/.test(identifier))) {
            const numId = parseInt(identifier);
            [pokemonRow] = await basePokemonQuery("p.id", numId);
        }

        if (!pokemonRow && typeof identifier === "string") {
            const normalizedIdentifier = identifier.toLowerCase().replace(/ /gmi, '-');
            [pokemonRow] = await basePokemonQuery("p.name", "'" + normalizedIdentifier + "'");
        }

        if (!pokemonRow && typeof identifier === "string") {

            const miniSearchMatches = possiblePokemon.search(identifier, { boost: { name: 2 } });
            if (miniSearchMatches.length > 0) {
                const bestMatchId = miniSearchMatches[0].id;
                [pokemonRow] = await basePokemonQuery("p.id", bestMatchId);
            }

        }

        if (!pokemonRow && typeof identifier === 'string') {
            const searchTerm = `%${identifier.toLowerCase()}%`;
            [pokemonRow] = await pokeapisql`
               SELECT
                p.id,
                p.name AS _id, -- Use name as _id (slug) for consistency
                p.name AS name,
                p.height,
                p.weight,
                p.base_experience,
                ps.gender_rate,
                ps.capture_rate,
                ps.base_happiness,
                ps.is_baby,
                ps.hatch_counter,
                ps.forms_switchable,
                ps.has_gender_differences,
                ps.evolves_from_species_id,
                stats.spd,
                stats.hp,
                stats.def,
                stats.atk,
                stats.spdef,
                stats.spatk,
                stats.eva,
                stats.acc,
                NULL::integer AS acc, -- Placeholder if not available in current schema
                NULL::integer AS eva, -- Placeholder if not available in current schema
                types.types,
                ps.pokemon_color_id,
                ps.pokemon_shape_id,
                ps.growth_rate_id,
                ps.pokemon_habitat_id,
                ps.is_mythical,
                ps.is_legendary,
                FALSE AS is_sub_legendary, -- Set explicitly as false based on schema mapping
                FALSE AS is_custom,        -- Set explicitly as false
                FALSE AS is_nonspawnable,  -- Set explicitly as false
                FALSE AS is_event,         -- Set explicitly as false
                NULL::text AS art,         -- Placeholder for art URL
                p.id AS dexid
            FROM pokemon_v2_pokemon p
            JOIN pokemon_v2_pokemonspecies ps ON ps.id = p.pokemon_species_id
            -- Subquery for stats
            LEFT JOIN (
                SELECT
                    s.pokemon_id,
                    MAX(CASE WHEN s.stat_id = 4 THEN s.base_stat END) AS spd, -- Speed
                    MAX(CASE WHEN s.stat_id = 1 THEN s.base_stat END) AS hp,  -- HP
                    MAX(CASE WHEN s.stat_id = 3 THEN s.base_stat END) AS def, -- Defense
                    MAX(CASE WHEN s.stat_id = 2 THEN s.base_stat END) AS atk, -- Attack
                    MAX(CASE WHEN s.stat_id = 6 THEN s.base_stat END) AS spdef, -- Special Defense
                    MAX(CASE WHEN s.stat_id = 5 THEN s.base_stat END) AS spatk, -- Special Attack
                    MAX(CASE WHEN s.stat_id = 7 THEN s.base_stat END) AS acc, -- Accuracy
                    MAX(CASE WHEN s.stat_id = 8 THEN s.base_stat END) AS eva -- Evasion
                FROM pokemon_v2_pokemonstat s
                GROUP BY s.pokemon_id
            ) stats ON stats.pokemon_id = p.id
            -- Subquery for types with names
            LEFT JOIN (
                SELECT
                    pt_sub.pokemon_id,
                    ARRAY_AGG(t.name ORDER BY pt_sub.slot) AS types
                FROM (
                    SELECT DISTINCT ON (pt.pokemon_id, pt.type_id)
                        pt.pokemon_id, pt.type_id, pt.slot
                    FROM pokemon_v2_pokemontype pt
                    ORDER BY pt.pokemon_id, pt.type_id, pt.slot
                ) pt_sub
                JOIN pokemon_v2_type t ON t.id = pt_sub.type_id
                GROUP BY pt_sub.pokemon_id
            ) types ON types.pokemon_id = p.id
                WHERE p.name ilike ${searchTerm}
                ORDER BY p.id ASC LIMIT 1
            `;

            // If still not found, check alt names from pokemon_v2_pokemonspeciesname
            if (!pokemonRow) {
                const [altNameRow] = await pokeapisql`SELECT pokemon_species_id FROM pokemon_v2_pokemonspeciesname WHERE name ILIKE ${searchTerm} OR genus ILIKE ${searchTerm} LIMIT 1`;
                if (altNameRow) {
                    [pokemonRow] = await basePokemonQuery("p.id", altNameRow.pokemon_species_id);
                }
            }
        }

        if (pokemonRow) {

            this.pokedex = pokemonRow;

            this.pokedex._id = this.pokedex._id ? this.pokedex._id.trim() : null;
            this.pokedex.name = this.pokedex.name ? this.pokedex.name.trim() : null;

            if (this.pokedex.types && this.pokedex.types.length > 0) {
                // Convert fetched type names to their corresponding ENUM IDs
                this.types = this.pokedex.types.map(typeName =>
                    Object.keys(ENUM_POKEMON_TYPES_ID).find(key => ENUM_POKEMON_TYPES_ID[key].toLowerCase() === typeName.toLowerCase()) || typeName // Fallback to name if ID not found
                );
            } else {
                this.types = [];
            }

            // Fetch all other detailed information (description, evolution, forms, etc.)
            await this.fetchDexData();

            // Also set the current Pokemon instance's _id to match the pokedex for consistency
            this.pokemon = this.pokedex._id;
            return this.pokedex;

        }

        return false; // Pokemon not found

    }

    async generateV2(id, mergingObject = {}) {

        // Full Chaos Mode
        if (!id && !this.pokemon && this.pokedex?.id) {
            await this.selectRandomV2();

            // ID Provided but not loaded
        } else if (id && !this.pokedex.id) {
            await this.getPokemonSpecies(id);

            // Pokemon Provided but not Loaded
        } else if (this.pokemon && !this.pokedex?.id) {
            await this.getPokemonSpecies(this.pokemon);
        }

        if (!this.pokedex?.id) {
            return false;
        }

        this.pokemon = this.pokedex._id;
        this.level = 1 + randomint(60);
        this.stats = { // Random IVs for the instance
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

    determineGender(ratio = this.pokedex.gender_rate) {

        if (ratio == -1) return 3; // 3 is for Genderless Genderbenders that make the Avatar look like a kid playing in the water

        return (ratio <= Chance().d8()) ? 2 : 1;

    }

    async selectRandomV2() {

        const [foundRow] = await pokeapisql`
            SELECT p.id, p.name AS _id, p.name AS name, ps.gender_rate, ps.is_mythical, ps.is_legendary
            FROM pokemon_v2_pokemon p
            JOIN pokemon_v2_pokemonspecies ps ON ps.id = p.pokemon_species_id
            WHERE p.is_default = TRUE -- Ensures main forms are selected
            ORDER BY random() LIMIT 1
        `;

        if (!foundRow) {
            return this.selectRandomV2();
        }

        await this.getPokemonSpecies(foundRow.id);

        this.pokemon = this.pokedex._id;

        return this.pokemon;

    }

    async getAvailableMovesV2() {

        if (!this.pokedex.id) return [];

        // TODO: Gotta decide which one we'll want to focus on || Mama Coco
        const [{ max: version_group_id }] = await pokeapisql`
            SELECT MAX(version_group_id) as max FROM pokemon_v2_pokemonmove 
            WHERE pokemon_id = ${this.pokedex.id}
        `;

        // Fetch move names for moves learned by leveling up (method_id = 1) at and below the current level
        return (await pokeapisql`
            SELECT m.name FROM pokemon_v2_pokemonmove as p 
            LEFT JOIN pokemon_v2_move as m ON (p.move_id = m.id) 
            WHERE pokemon_id = ${this.pokedex.id} 
            AND p.move_learn_method_id = 1 
            AND p.version_group_id = ${version_group_id} 
            AND level <= ${this.level || 1}
        `).map(x => x.name);

    }

    async SpawnFriendlyV2(forced = false) {

        const generatedPokemon = await this.generateV2();

        if (!generatedPokemon) return false;

        if (!forced && (generatedPokemon.pokedex.is_nonspawnable ||
            (generatedPokemon.pokedex.is_legendary || generatedPokemon.pokedex.is_sub_legendary || generatedPokemon.pokedex.is_mythical) && randomint(300) > 3
        )) {
            await this.selectRandomV2();
            return this.SpawnFriendlyV2();
        }

        const findAltNames = await pokeapisql`
            SELECT name from pokemon_v2_pokemonspeciesname
            WHERE pokemon_species_id = ${this.pokedex.id}
        `;

        this.spawn_names = [this.pokedex.name, this.pokedex._id].concat(findAltNames.map(x => x.name)).filter(x => x);

        return generatedPokemon;

    }

    calculateIV(type = "hp") {
        return IVCalculator(this.pokedex[type], this.stats[type], this.level, type, this.nature);
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

    getStatsV2(fallBack = false) {
        if (!this.pokedex.id) return {}; // No species ID, no stats

        const info = {
            hp: this.pokedex.hp,
            atk: this.pokedex.atk,
            def: this.pokedex.def,
            spatk: this.pokedex.spatk,
            spdef: this.pokedex.spdef,
            spd: this.pokedex.spd
        };

        if (!fallBack) return info; // If not forcing, just return the direct properties

        this.pokedex.stats = info; // Set base stats on the pokedex object for consistency

        return this.pokedex.stats;
    }

    async getDescriptionV2() {

        if (!this.pokedex.id) return false;

        const [descriptionRow] = await pokeapisql`
        SELECT flavor_text FROM public.pokemon_v2_pokemonspeciesflavortext
        WHERE pokemon_species_id = ${this.pokedex.id}
        AND language_id = 9
        ORDER BY version_id DESC LIMIT 1`;

        return descriptionRow;

    }

    async getAltNamesV2() {

        if (!this.pokedex.id) return false;

        return await pokeapisql`
            SELECT p.name, l.iso3166 as flagcode
            FROM pokemon_v2_pokemonspeciesname AS p
            LEFT JOIN pokemon_v2_language as l ON (p.language_id = l.id)
            WHERE pokemon_species_id = ${this.pokedex.id}
        `; // AND l.official = TRUE

    }

    getNextLevelEXP(level = this.level) {
        if (!this.pokedex?.base_experience) {
            return calculateNextLevelEXP(level, 100); // Default base_experience for calculation
        }
        return calculateNextLevelEXP(level, this.pokedex.base_experience);
    }

    gainedEXP(level = this.level) {
        if (!this.pokedex?.base_experience) {
            return 0;
        }
        const faintedPokemonLevel = Chance().d12(); // Random level for the fainted Pokemon
        const gainedEXP = (
            ((this.pokedex.base_experience * faintedPokemonLevel) / (5 * 1)) * Math.pow(((faintedPokemonLevel * 2 + 10) / (faintedPokemonLevel + level + 10)), 2.5) + 1
        );
        return gainedEXP;
    }

    async getItemEvolutionsV2(id = this.pokedex.id) {
        if (!id) return [];
        return await pokeapisql`
                SELECT 
                    pe.id as evoid, 
                    ps_evolved.id as pokemon_id, 
                    p_evolved.name as _id, 
                    pe.min_level, 
                    pe.time_of_day, 
                    pe.min_happiness, 
                    pe.min_affection, 
                    pe.evolution_item_id, 
                    pe.gender_id, 
                    i.name as item_name, 
                    i.cost as item_cost 
                FROM pokemon_v2_pokemonevolution as pe 
                JOIN pokemon_v2_pokemonspecies as ps_current ON pe.pokemon_species_id = ps_current.id
                JOIN pokemon_v2_pokemonspecies as ps_evolved ON pe.evolved_species_id = ps_evolved.id
                JOIN pokemon_v2_pokemon as p_evolved ON p_evolved.pokemon_species_id = ps_evolved.id AND p_evolved.is_default = TRUE
                INNER JOIN pokemon_v2_item as i ON (pe.evolution_item_id = i.id OR pe.held_item_id = i.id) -- Either evolution_item or held_item
                WHERE ps_current.id = ${id}
                ORDER BY pe.min_level ASC, pe.gender_id DESC
            `; // -- AND pe.evolution_trigger_id = 3 -- Trigger ID 3 is 'use-item'
    }

    async fetchEvolutionByID(id) {
        if (!id) return {};

        const [row] = await pokeapisql`
                SELECT 
                    pe.id, 
                    ps_pre.name as pre_id, -- Original species name (slug)
                    ps_evolved.name as _id, -- Evolved species name (slug)
                    pe.evolution_item_id as itemid, 
                    pe.gender_id 
                FROM pokemon_v2_pokemonevolution as pe 
                LEFT JOIN pokemon_v2_pokemonspecies as ps_evolved ON (ps_evolved.id = pe.evolved_species_id)
                LEFT JOIN pokemon_v2_pokemonspecies as ps_pre ON (ps_pre.id = pe.pokemon_species_id)
                WHERE pe.id = ${id};
            `;
        return row;
    }

    async fetchDexData() {
        if (!this.pokedex.id) return; // Requires a valid species ID

        // Populate types and stats onto the pokedex object
        // These are mostly handled by the initial getPokemonSpecies query now,
        // but this ensures consistency and can re-process if needed.
        // this.getTypesV2(true);
        this.getStatsV2(true); // Ensures stats object is set on pokedex

        // Fetch description and alternative names
        const descriptionResult = await this.getDescriptionV2();
        this.pokedex.description = descriptionResult ? descriptionResult.flavor_text : null;

        this.pokedex.altNames = [];
        const altNames = await this.getAltNamesV2();
        if (altNames) {
            for (const altName of altNames.reverse()) { // Reversing for a specific display order might be needed
                // Add unique alternative names
                if (!this.pokedex.altNames.find(x => x.flagcode == altName.flagcode || x.name == altName.name)) {
                    this.pokedex.altNames.push(altName);
                }
            }
        }

        // Adjust weight and height units (assuming decimetres/hectograms to meters/kilograms)
        this.pokedex.weight = this.pokedex.weight ? this.pokedex.weight / 10 : null;
        this.pokedex.height = this.pokedex.height ? this.pokedex.height / 10 : null;

        // Fetch evolution chain, forms, and fusions
        this.pokedex.evolution_chain = await this.getEvolutionV2();
        this.pokedex.forms = await this.getEvolutionFormsV2();
        this.pokedex.fusions = this.getFusionsV2();

        return this.pokedex;
    }

    async getFusionsV2() {
        // fusionPokemon is imported from a local JSON file.
        // This will remain the same as it's not from the PokeAPI schema.
        return fusionPokemon.filter(x => x.first_pokemon == this.pokedex._id || x.second_pokemon == this.pokedex._id);
    }

    async getEvolutionFormsV2(name = this.pokedex.name) { // Use pokedex.name as the base for forms
        if (!name) return [];
        return await pokeapisql`
                SELECT p.id, p.name as _id, p.name FROM pokemon_v2_pokemon as p
                JOIN pokemon_v2_pokemonspecies ps ON ps.id = p.pokemon_species_id
                WHERE ps.id = ${this.pokedex.id} AND p.name != ${this.pokedex.name} -- Exclude the default form itself
                ORDER BY p.name ASC
            `;
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
        return await pokeapisql.unsafe(`SELECT s.id as pokemon_id, ps.id, s.name, pre.name as evolved_from_name, ps.evolves_from_species_id as evolved_from, p.min_level, p.min_happiness, p.min_affection, p.time_of_day, p.evolution_item_id, item.name as item_name, t.name as trigger, item.cost as item_price, trade_evo.name as trade_pokemon
        FROM pokemon_v2_pokemon as s
        LEFT JOIN pokemon_v2_pokemonspecies ps ON ps.id = s.pokemon_species_id
        LEFT JOIN pokemon_v2_pokemonevolution as p on (p.evolved_species_id = s.id)
        LEFT JOIN pokemon_v2_evolutiontrigger as t on (t.id = p.evolution_trigger_id)
        LEFT JOIN pokemon_v2_pokemon as trade_evo on p.trade_species_id = trade_evo.id
        LEFT JOIN pokemon_v2_pokemon as pre on (pre.id = ps.evolves_from_species_id)
        LEFT JOIN pokemon_v2_item as item on (item.id = p.evolution_item_id OR item.id = p.held_item_id)
        WHERE ${from ? "ps.evolves_from_species_id" : "s.id"} = ${id || this.pokedex.id} AND p.location_id is null;`)
    }

    readyBattleMode() {
        // Battle Mode setup using species data from this.pokedex and instance data
        if (!this.pokedex?.id) {
            console.error("Pokedex data not loaded for readyBattleMode. Cannot set up battle.");
            return false; // Or throw an error
        }

        this.battle = {
            original_pokemon: this.pokemon, // Original _id of the instance
            pokemon: this.pokemon,         // Current _id (can change with Giga/Mega)
            stat: this.stats,              // Instance's individual stats (IVs, EVs)
            types: this.pokedex.types_full_names || this.pokedex.types, // Use the full names of types
            current_hp: Math.floor(((this.pokedex.hp + this.stats.hp) * 2 * this.level) / 100 + 5 + this.level), // Calculated current HP
            max_hp: Math.floor(((this.pokedex.hp + this.stats.hp) * 2 * this.level) / 100 + 5 + this.level),     // Calculated max HP
            status: {},                    // Status conditions (e.g., burn, frozen)
            mods: {},                      // Stat modifiers
            giga: false                    // Giga/Mega status
        };
        return this.battle;
    }

    async readyBattleImage() {
        if (!this.battle) return []; // Only proceed if battle mode is ready
        if (!this.pokedex?.id) {
            console.error("Pokedex data not loaded for readyBattleImage.");
            return { back: "", front: "" };
        }

        // readySinglePokemonFrontBack expects the pokedex species object
        const { back, front } = await readySinglePokemonFrontBack(this.pokedex, this.shiny, this.battle.giga);

        this.battle.img = { back, front };
        return this.battle.img;
    }

    async levelUp(postgres, msg, increaseLevel = 0) {
        if (this.level >= 100) return false; // Max level reached

        // Ensure pokedex data is available for evolution checks and base experience
        if (!this.pokedex.id) {
            await this.getPokemonSpecies(this.pokemon);
            if (!this.pokedex.id) {
                return await this.save(postgres, { level: this.level, exp: this.exp }), // Still save level/exp
                    { levelIncreased: false, level: this.level, pokemon: this.pokemon };
            }
        }

        const info = this.pokedex; // Use the already loaded pokedex data

        // Fingers crossed that this works

        const nextEXP = this.gainedEXP(this.level); // Calculate gained EXP
        this.exp += parseInt(nextEXP); // Add to current EXP

        const expToReach = this.getNextLevelEXP(this.level + 1) - this.getNextLevelEXP(this.level);
        const preLevel = this.level; // Store level before increase

        // Increase level if enough EXP is gained and then obviously go back to 0 because who wants to break the system? Not me
        if (this.exp >= expToReach) this.level++, this.exp = 0;
        if (increaseLevel) this.level += increaseLevel; // Force level increase
        if (this.level >= 100) this.level = 100; // Cap at level 100, unless you're crazy for more

        // If holding Everstone, or no evolution chain, or evolution chain is empty, save and return
        if (this.item == "everstone" || !info.evolution_chain || info.evolution_chain.length === 0) {
            return await this.save(postgres, { level: this.level, exp: this.exp }),
                { levelIncreased: preLevel != this.level, level: this.level, pokemon: this.pokemon, hasEvolved: false, evolvedPokemon: this.pokemon };
        }

        let evolvedPokemon = this.pokemon; // Default to current Pokemon

        const findCurrentSpeciesInChain = (chainNode, currentSpeciesId) => {
            if (!chainNode) return null;
            if (chainNode.id === currentSpeciesId) return chainNode;
            for (const nextEvo of chainNode.evolves_to || []) {
                const found = findCurrentSpeciesInChain(nextEvo, currentSpeciesId);
                if (found) return found;
            }
            return null;
        };

        const currentSpeciesNode = findCurrentSpeciesInChain(info.evolution_chain[0], info.id);

        if (currentSpeciesNode && currentSpeciesNode.evolves_to && currentSpeciesNode.evolves_to.length > 0) {
            for (const nextEvolutionNode of currentSpeciesNode.evolves_to) {
                for (const evoDetail of nextEvolutionNode.evolution_details) {
                    if (evoDetail.trigger === 'level-up' && (evoDetail.min_level === null || parseInt(evoDetail.min_level) <= this.level)) {
                        const genderMatch = !evoDetail.gender_id || evoDetail.gender_id === this.gender;
                        const timeOfDayMatch = !evoDetail.time_of_day || evoDetail.time_of_day === getTime().toLowerCase() || evoDetail.time_of_day === Moon.lunarPhase(new Date(), { hemisphere: Hemisphere.NORTHERN }).toLowerCase();
                        if (genderMatch && timeOfDayMatch) {
                            evolvedPokemon = nextEvolutionNode._id;
                            break; // Found an evolution, stop checking this node
                        }
                    }
                }
                if (evolvedPokemon !== this.pokemon) break; // If evolved, break outer loop too
            }
        }


        // Save
        return await this.save(postgres, { level: this.level, exp: this.exp, pokemon: evolvedPokemon }),
            // Returned Obj
            { levelIncreased: preLevel != this.level, level: this.level, hasEvolved: evolvedPokemon != this.pokemon, pokemon: this.pokemon, evolvedPokemon };
    }
}

export default Pokedex;