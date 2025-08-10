import { Chance } from "chance";
import { ENUM_POKEMON_TYPES, POKEMON_NATURES } from "../Utilities/Data/enums.js";
import IVCalculator from "../Utilities/Pokemon/IVCalculator.js";
import randomint from "../Utilities/Misc/randomint.js";
import spawnImage from "../Utilities/Pokemon/spawnImage.js";
import time_gradient from "../Utilities/Misc/time_gradient.js";
import calculateNextLevelEXP from "../Utilities/Misc/calculateNextLevelEXP.js";
import getTime from "../Utilities/Misc/getTime.js";
import builder from "../Modules/Database/QueryBuilder/queryGenerator.js";
import { readySinglePokemonFrontBack } from "../Utilities/Pokemon/pokemonBattleImage.js";
import moves from "../Utilities/Data/moves.json" with {type: "json"}; // Local moves data
import capitalize from "../Utilities/Misc/capitalize.js";
import pokemondb from "../Modules/Database/pokedb.js";
import Move from "./move.js";
import { logCustomReport } from "../Utilities/User/logReport.js";

class Pokemon {

    constructor(pokemonObject = {}) {

        if (pokemonObject.id || pokemonObject.pokemon) {
            this.id = pokemonObject.id;
            this.idx = pokemonObject.idx;
            this.user_id = pokemonObject.user_id;

            // TODO: Guild-based Pokemon feature coming soon == Easter egg >:)
            this.guild_id = pokemonObject.guild_id || null;

            this.pokemon = pokemonObject.pokemon;
            this.stats = {                              // Individual stats (IVs/EVs) for this instance
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

            this.types = pokemonObject.types || [];
            this.pokedex = pokemonObject.pokedex || {};

        }

    }

    async spawnToChannel(spawnChannel, commandID = 0) {

        try {

            logCustomReport({ command: 101, shortval: this.pokemon || "???", guild: spawnChannel.guild.id, channel: spawnChannel.id });

            // Pokedex wasn't loaded, not worth sending
            if (!this.pokedex?.id) {
                return false;
            }

            return spawnChannel.send({
                files: [{
                    attachment: await spawnImage(this.pokedex._id.toLowerCase(), this.shiny),
                    name: "spawn.png"
                }],
                embeds: [{
                    title: Chance().pickone(["A wild pokemon just raided the chat!", "A wild pokemon is looking for attention!", "For some reason a pokemon is here.", "Shot, here we go again.", "Apparently a pokemon is lurking", "Blame the devs for this", "Seems like someone forgot to bring back the milk from the store", "Arceus dumped this on you", "Rejoice, your adopted child returned to you", "You tried to run away and failed", "Cynthia or this adorable Mon? Take your pick"]),
                    color: time_gradient[(new Date().getHours())],
                    iamge: {
                        url: "attachment://spawn.png"
                    },
                    description: `Use the </catch:${commandID}> or \`@Pokedi c\` command to tame it! Or just ignore it?`,
                    footer: {
                        text: " 🌹 https://pokedi.xyz 🌹"
                    }
                }]
            });

        } catch (err) { }

    }

    toJSON() {
        return {
            id: this.id,
            pokemon: this.pokemon,
            idx: this.idx,
            name: this.name,
            user_id: this.user_id,
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
        return Object.assign(...Object.entries(this.toJSON()).filter(x => x[1] !== undefined).map(x => ({ [x[0]]: x[1] })));
    }

    async save(postgres, data, rawQuery) {

        // You obviously need Postgres
        if (!postgres) {
            return false;
        }

        // Ready variable for later
        let query;

        // If ID not defined => Pokemon doesn't exist yet => Insert
        if (!this.id) {
            const toSaveData = data || this.toDefinedJSON();
            query = builder.insert("pokemon", toSaveData).returning("*");
        } else {

            // Or just Update it
            query = builder.update("pokemon", data || this.toDefinedJSON()).where({ id: BigInt(this.id) }).returning("*");
        }

        // Raw Query returns the Query Values for us to use later
        if (rawQuery) return query;

        try {

            const [row] = await postgres.unsafe(query.text, query.values);

            if (!this.id && row) {
                this.id = row.id;
            }

            return row;

        } catch (err) {
            return false;
        }

    }

    async fetchPokemon(postgres, columns = "*") {

        if (!postgres || this.id) {
            return false;
        }

        const query = builder.select("pokemon", columns).where({ id: BigInt(this.id) });

        try {
            const [row] = await postgres.unsafe(query.text, query.values);
            return Object.assign(this, new Pokemon(row || {}));
        } catch (err) {
            return false;
        }


    }

    async fetchPokemonByIDX(postgres, columns = "*") {

        if (!postgres) return false;

        if (!this.idx || !this.user_id) {

            if (this.id) return this.fetchPokemon(postgres, columns);

            return false;

        }

        const query = builder.select("pokemon", columns).where({ idx: this.idx }).and({ user_id: this.user_id });

        try {
            const [row] = await postgres.unsafe(query.text, query.values);
            return Object.assign(this.exp, new Pokemon(row || {}));
        } catch (err) {
            return false
        }

    }

}