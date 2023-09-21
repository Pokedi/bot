import { Chance } from "chance";
import { ENUM_POKEMON_TYPES, POKEMON_NATURES } from "../Utilities/Data/enums.js";
import findPokemon from "../Utilities/Pokemon/findPokemon.js";
import IVCalculator from "../Utilities/Pokemon/IVCalculator.js";
import filterPokemon from "../Utilities/Pokemon/filterPokemon.js";
import randomint from "../Utilities/Misc/randomint.js";
import spawnImage from "../Utilities/Pokemon/spawnImage.js";
import time_gradient from "../Utilities/Misc/time_gradient.js";
import calculateNextLevelEXP from "../Utilities/Pokemon/calculateNextLevelEXP.js";
import getTime from "../Utilities/Misc/getTime.js";
import builder from "../Modules/Database/QueryBuilder/queryGenerator.js";
import { readySinglePokemonFrontBack } from "../Utilities/Pokemon/pokemonBattleImage.js";
const chance = Chance();

class Pokemon {
    constructor(pokemonObject = { id, user_id, guild_id, pokemon, s_hp, s_atk, s_def, s_spatk, s_spdef, s_spd, s_hp, level, exp, nature, shiny, gender, name, item, m_1, m_2, m_3, m_4 }) {
        if (pokemonObject?.pokemon || pokemonObject?.id) {
            this.id = pokemonObject.id;
            this.idx = pokemonObject.idx;
            this.user_id = pokemonObject.user_id;
            this.guild_id = pokemonObject.guild_id;
            this.pokemon = pokemonObject.pokemon;
            this.stats = {
                hp: pokemonObject.s_hp,

                atk: pokemonObject.s_atk,
                def: pokemonObject.s_def,

                spatk: pokemonObject.s_spatk,
                spdef: pokemonObject.s_spdef,

                spd: pokemonObject.s_spd
            };
            this.moves = [pokemonObject.m_1, pokemonObject.m_2, pokemonObject.m_3, pokemonObject.m_4].filter(x => x);
            this.level = pokemonObject.level;
            this.item = pokemonObject.item;
            this.shiny = pokemonObject.shiny;
            this.exp = pokemonObject.exp;
            this.nature = pokemonObject.nature;
            this.gender = pokemonObject.gender;
            this.name = pokemonObject.name;
            this.type = this.convertTypes(this.getNature());
        } else
            if (pokemonObject) Object.assign(this, pokemonObject);
    }

    getNature() {
        return this.getDetails().types;
    }

    generate(pokemonName, mergingObject = {}) {
        let base = {};
        if (pokemonName) { base = findPokemon(pokemonName) } else { base = findPokemon() };
        this.pokemon = base._id;
        this.stats = {
            hp: randomint(),

            atk: randomint(),
            def: randomint(),

            spatk: randomint(),
            spdef: randomint(),

            spd: randomint()
        }
        this.level = randomint(60);
        this.exp = 1;
        this.nature = Chance().pickone(POKEMON_NATURES)
        this.moves = Chance().shuffle(this.getAvailableMoves(base)).splice(0, 4);
        this.types = this.convertTypes(base.types);
        return Object.assign(this, mergingObject);
    }

    // Function to spawn a friendly Pokemon
    spawnFriendly(custom) {
        const pokemonFilter = x => custom ? x._id == custom : !x.legendary || x.legendary && (typeof x.legendary == "string" && !(x.legendary.startsWith("nonspawn") || x.legendary.startsWith("custom")))
        // If a custom Pokemon is provided, assign it to chosenPokemon; otherwise, randomly select a Pokemon from the filtered list
        const chosenPokemon = chance.pickone(chance.pickset(filterPokemon(pokemonFilter)));
        // If the chosen Pokemon is legendary and a random number between 1 and 100 is greater than 10, recursively call spawnFriendly() to choose another Pokemon
        if (!custom && chosenPokemon.legendary && chance.d100() > 10) return this.spawnFriendly();
        // Generate a new Pokemon based on the chosenPokemon ID
        const generatedPokemon = this.generate(chosenPokemon._id);
        // Get altNames
        const altNames = this.getDetails().alt || {};
        // Get extraNames
        const extraNames = this.getDetails().extra || [];
        // Hold alternative names
        this.spawn_names = [].concat(...Object.values(altNames).map(x => [].concat(...Object.values(x))), extraNames);
        // Return Pokemon
        return generatedPokemon;
    }

    // Spawn Pokemon to Channel
    async spawnToChannel(spawnChannel) {
        try {
            // Return spawnImage-generated Image
            return spawnChannel.send({
                files: [{
                    attachment: await spawnImage(this.pokemon, this.shiny),
                    name: "spawn.png"
                }],
                embeds: [{
                    title: Chance().pickone(["A wild pokemon just raided the chat!", "A wild pokemon is looking for attention!", "For some reason a pokemon is here.", "Shot, here we go again.", "Apparently a pokemon is lurking"]),
                    color: time_gradient[(new Date().getHours())],
                    image: {
                        url: "attachment://spawn.png"
                    },
                    description: "Use the `/catch` command to tame it! Or just ignore it?",
                    footer: {
                        text: " 🌹 https://pokedi.xyz 🌹"
                    }
                }]
            });
        } catch (err) {
            console.log(err); return true;
        }
    }

    getAvailableMoves(base) {
        if (!base.moves) return ['tackle'];
        return Object.entries(base.moves).filter(x => parseInt(x[1]) <= this.level).map(x => x[0]);
    }

    convertTypes(types) {
        return types.map(x => ENUM_POKEMON_TYPES[x]);
    }

    toJSON() {
        return {
            id: this.id, pokemon: this.pokemon,
            idx: this.idx,
            name: this.name,
            user_id: this.user_id,
            guild_id: this.guild_id,
            s_hp: this.stats.hp,
            s_atk: this.stats.atk,
            s_def: this.stats.def,
            s_spatk: this.stats.spatk,
            s_spdef: this.stats.spdef,
            s_spd: this.stats.spd,
            level: this.level,
            exp: this.exp,
            nature: this.nature,
            shiny: this.shiny,
            gender: this.gender,
            item: this.item,
            m_1: this.moves[0], m_2: this.moves[1], m_3: this.moves[2], m_4: this.moves[3]
        }
    }

    toDefinedJSON() {
        return Object.assign(...Object.entries(this.toJSON()).filter(x => x[1] != undefined).map(x => ({ [x[0]]: x[1] })));
    }

    async save(postgres, data) {

        if (!postgres) return false;

        if (!this.id) {

            const query = builder.insert("pokemon", this.toDefinedJSON()).returning("*");

            const [row] = await postgres.unsafe(query.text, query.values);

            return row;
        }

        const query = builder.update("pokemon", data || this.toDefinedJSON()).where({ id: this.id }).returning("*");

        const [row] = await postgres.unsafe(query.text, query.values);

        return await row;
    }

    async fetchPokemon(postgres) {

        if (!postgres || !this.id) return false;

        const query = builder.select("pokemon", "*").where({ id: BigInt(this.id) });

        const [row] = await postgres.unsafe(query.text, query.values);

        return Object.assign(this, new Pokemon(row || {}));
    }

    async fetchPokemonByIDX(postgres) {

        if (!postgres) return false;

        if (!this.idx) return this.fetchPokemon(postgres);

        const query = builder.select("pokemon", "*").where({ idx: this.idx }).and({ user_id: this.user_id });

        const [row] = await postgres.unsafe(query.text, query.values);

        return Object.assign(this, new Pokemon(row || {}));
    }

    getDetails() {
        return findPokemon(this.pokemon) || {};
    }

    getNextLevelEXP(level = this.level) {
        return calculateNextLevelEXP(level, this.getDetails().base_exp);
    }

    gainedEXP(level = this.level) {
        const faintedPokemonLevel = Chance().d12();
        const gainedEXP = (((this.getDetails().base_exp * faintedPokemonLevel) / (5 * 1)) * Math.pow(((faintedPokemonLevel * 2 + 10) / (faintedPokemonLevel + level + 10)), 2.5) + 1);
        return gainedEXP;
    }

    getBaseStats() {
        const { hp, atk, def, spatk, spdef, spd } = this.getDetails().stat;

        return { hp, atk, def, spatk, spdef, spd };
    }

    calculateIV(type = "hp") {
        return IVCalculator(this.getBaseStats()[type], this.stats[type], this.level, type, this.nature);
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

    calculateTotalIV() {
        return (((this.stats.hp + this.stats.atk + this.stats.def + this.stats.spatk + this.stats.spd + this.stats.spdef) / 186) * 100).toFixed(2);
    }

    async release(postgres) {

        const query = builder.update("pokemon", { user_id: null }).where({ id: BigInt(this.id) }).returning("*");

        const [row] = await postgres.unsafe(query.text, query.values);

        return row;
    }

    async addToUserDex(postgres) {

        const query = builder.select("dex").where({ user_id: BigInt(this.user_id) }).and({ pokemon: this.pokemon });

        const [row] = await postgres.unsafe(query.text, query.values);

        if (row) {
            const query = builder.update("dex", {
                count: { increment: this.shiny ? 0 : 1 },
                shinies: { increment: this.shiny ? 1 : 0 },
                unclaimed_normal: { increment: this.shiny ? 0 : 1 },
                unclaimed_shinies: { increment: this.shiny ? 1 : 0 }
            }).where({ user_id: BigInt(this.user_id), pokemon: this.pokemon }).returning("*");

            const [row] = await postgres.unsafe(query.text, query.values);

            return row;
        } else {

            const query = builder.insert("dex", {
                user_id: this.user_id,
                pokemon: this.pokemon,
                count: this.shiny ? 0 : 1,
                shinies: this.shiny ? 1 : 0,
                giga: 0,
                unclaimed_normal: this.shiny ? 0 : 1,
                unclaimed_shinies: this.shiny ? 1 : 0
            }).returning("*");

            const [row] = await postgres.unsafe(query.text, query.values);

            return row;
        }
    }

    async levelUp(postgres, msg, increaseLevel = 0) {
        // Return if above Level 100
        if (this.level >= 100) return false;

        // Check if Info available
        const info = this.getDetails();
        // Return if Not-Existent
        if (!info) return true;

        // Gained EXP
        const nextEXP = this.gainedEXP(this.level);

        // Reassign EXP
        this.exp += nextEXP;

        // toReach
        const expToReach = this.getNextLevelEXP(this.level + 1) - this.getNextLevelEXP(this.level);

        // Pre-Level
        const preLevel = this.level;

        // Increase EXP
        if (this.exp >= expToReach) this.level++, this.exp = 0;
        // Increase Level if forced
        if (increaseLevel) this.level += increaseLevel;
        // Fix overIncreased Level
        if (this.level >= 100) this.level = 100;

        // Check if Everstone || Ignore if evolution not available
        if (this.item == "everstone" || !info.evolution)
            // Save
            return await this.save(postgres, { level: this.level, exp: this.exp }),
                // Returned Obj
                { levelIncreased: preLevel != this.level, level: this.level, pokemon: this.pokemon };

        // Check Pokemon through Levels
        const { level: evoLevel, time: evoTime, name: evoName } = info.evolution;

        // Evolved Pokemon Variable
        let evolvedPokemon;

        // Level Evolutions
        if (evoLevel) {
            let currentPokemon = this.pokemon;
            const pokemonLevel = Object.entries(evoLevel).find(x => x[1].name == currentPokemon)[0];
            for (const row in evoLevel) {
                const levelPokemon = evoLevel[row].name;
                if (parseInt(row) <= this.level && pokemonLevel <= parseInt(row) && !evolvedPokemon && levelPokemon != currentPokemon) evolvedPokemon = levelPokemon;
            }
        }

        // Time-Based Evolutions
        const currentTime = getTime();

        if (evoTime) {
            if (evoTime[currentTime]) {
                if (!evoTime[currentTime].level || evoTime[currentTime].level <= this.level) {
                    evolvedPokemon = evoTime[currentTime].name;
                }
            }
        }

        // Name-Based Evolutions
        if (evoName && (this.name)) {
            try {
                const selectName = Object.keys(evoName).find(x => (new RegExp(x, "gmi")).test(this.name));
                if (selectName) {
                    if ((!evoName[selectName].level || evoName[selectName].level <= this.level) && (!evoName[selectName].time || evoName[selectName].time == currentTime)) {
                        evolvedPokemon = evoName[selectName].name
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }

        // Channel-Based Evolutions
        if (evoName && (msg && msg.channel.name)) {
            try {
                const selectName = Object.keys(evoName).find(x => (new RegExp(x, "gmi")).test(msg.channel.name));
                if (selectName) {
                    if ((!evoName[selectName].level || evoName[selectName].level <= this.level) && (!evoName[selectName].time || evoName[selectName].time == currentTime)) {
                        evolvedPokemon = evoName[selectName].name
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }

        // Save
        return await this.save(postgres, { level: this.level, exp: this.exp, pokemon: evolvedPokemon || this.pokemon }),
            // Returned Obj
            { levelIncreased: preLevel != this.level, level: this.level, hasEvolved: evolvedPokemon != this.pokemon, pokemon: this.pokemon, evolvedPokemon };
    }



    // Battle Methods
    readyBattleMode() {

        // Battle Mode
        this.battle = {
            // Original Pokemon - In case of Giga + Mega
            original_pokemon: this.pokemon,
            // Current Pokemon
            pokemon: this.pokemon,
            // Current Stats
            stat: this.stats,
            // Position as Image
            pos: this.getDetails().pos,
            // Types
            types: this.types,
            // Current HP
            current_hp: Math.floor(((this.getBaseStats().hp + this.stats.hp) * 2 * this.level) / 100 + 5 + this.level),
            // Max HP
            max_hp: Math.floor(((this.getBaseStats().hp + this.stats.hp) * 2 * this.level) / 100 + 5 + this.level),
            // Status of Pokemon - Burn, Frozen, etc.
            status: {},
            // Check if Giga'd
            giga: false
        }

        return this.battle;
    }

    async readyBattleImage() {

        // Will not continue without a battle
        if (!this.battle) return [];

        const { back, front } = await readySinglePokemonFrontBack(this.getDetails(), this.shiny, this.battle.giga);

        this.battle.img = {
            back,
            front
        };

        return this.battle.img;
    }
}

export default Pokemon;