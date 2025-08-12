import { Chance } from "chance";
import { ENUM_POKEMON_TYPES } from "../Utilities/Data/enums.js";
import spawnImage from "../Utilities/Pokemon/spawnImage.js";
import time_gradient from "../Utilities/Misc/time_gradient.js";
import builder from "../Modules/Database/QueryBuilder/queryGenerator.js";
import { readySinglePokemonFrontBack } from "../Utilities/Pokemon/pokemonBattleImage.js";
import moves from "../Utilities/Data/moves.json" with {type: "json"}; // Local moves data
import capitalize from "../Utilities/Misc/capitalize.js";
import Move from "./move.js";
import { logCustomReport } from "../Utilities/User/logReport.js";

class Pokemon {

    constructor(pokemonObject = {}) {

        this.mergePokemonObjectToClass(pokemonObject);

    }

    mergePokemonObjectToClass(pokemonObject = {}) {
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

        if (!postgres || this.pokemon) {
            return false;
        }

        const query = builder.select("pokemon", columns).where({ id: BigInt(this.id) });

        try {
            const [row] = await postgres.unsafe(query.text, query.values);
            this.mergePokemonObjectToClass(row);
            return this;
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

    async release(postgres) {

        if (!postgres || !this.id) return false;

        // Another Easter Egg idea: Possibility for the released Pokemon to Spawn somewhere around the world

        const query = builder.update("pokemon", { user_id: null }).where({ id: BigInt(this.id) }).returning("*");

        try {
            const [row] = await postgres.unsafe(query.text, query.values);
            return row;
        } catch (err) {
            return false;
        }

    }

    calculateTotalIV() {
        return (((this.stats.hp + this.stats.atk + this.stats.def + this.stats.spatk + this.stats.spd + this.stats.spdef) / 186) * 100).toFixed(2);
    }

    async addToUserDex(postgres) {

        if (!postgres || !this.user_id || !this.pokemon) return false;

        const queryFind = builder.select("dex").where({ user_id: BigInt(this.user_id) }).and({ pokemon: this.pokemon });

        try {

            const [row] = await postgres.unsafe(queryFind.text, queryFind.values);

            if (row) {

                const queryUpdate = builder.update("dex", {
                    count: (row.count || 0) + (this.shiny ? 0 : 1),
                    shiny: (row.shinies || 0) + (this.shiny ? 1 : 0),
                    unclaimed_normal: (row.unclaimed_normal || 0) + (this.shiny ? 0 : 1),
                    unclaimed_shinies: (row.unclaimed_shinies || 0) + (this.shiny ? 1 : 0)
                }).where({ user_id: BigInt(this.user_id), pokemon: this.pokemon }).returning("*");

                const [updatedRow] = await postgres.unsafe(queryUpdate.text, queryUpdate.values);

                return updatedRow;

            } else {

                // First Catch
                // [08/10/2025 23:26] I think I should update the table itself to add the default values? Yeah, be right back, gonna update via pgAdmin

                const queryInsert = builder.insert("dex", {
                    user_id: this.user_id,
                    pokemon: this.pokemon,
                    count: this.shiny ? 0 : 1,
                    shinies: this.shiny ? 1 : 0,
                    giga: 0,
                    unclaimed_normal: this.shiny ? 0 : 1,
                    unclaimed_shinies: this.shiny ? 1 : 0
                }).returning("*");

                const [insertedRow] = await postgres.unsafe(queryInsert.text, queryInsert.values);

                return insertedRow;

            }


        } catch {
            return false;
        }

    }

    // Fetch Moves
    async fetchMoves() {

        this.processedMoves = await Promise.all(this.moves.map(x => new Move().fetch(x, false)));

        return this.processedMoves;

    }

    // Definitely would be nice to return details beyond this
    // Pokemon Showdown Move Details might need to get checked out but that's a backend thing of its own
    returnMoves() {
        return this.moves.map(x => {
            const moveDetails = { ...moves[x], id: x };
            moveDetails.name = capitalize(moveDetails.id.replace(/-/gmi, ' '));
            moveDetails.type = ENUM_POKEMON_TYPES[moveDetails.t];
            return moveDetails;
        })
    }

    // Battle Methods
    readyBattleMode() {
        if (!this.pokedex?.id) {
            console.error("Pokedex data not loaded for readyBattleMode. Cannot set up battle.");
            return false;
        }

        // Battle Mode setup
        this.battle = {
            original_pokemon: this.pokemon,
            pokemon: this.pokemon,
            stat: this.stats,
            types: this.pokedex.types_full_names || this.pokedex.types, // Use full names of types
            current_hp: Math.floor(((this.pokedex.hp + this.stats.hp) * 2 * this.level) / 100 + 5 + this.level),
            max_hp: Math.floor(((this.pokedex.hp + this.stats.hp) * 2 * this.level) / 100 + 5 + this.level),
            status: {},
            mods: {},
            giga: false
        };

        return this.battle;
    }

    // Ready Battle Images
    async readyBattleImage() {
        if (!this.battle) return [];
        if (!this.pokedex?.id) {
            console.error("Pokedex data not loaded for readyBattleImage.");
            return { back: "", front: "" };
        }

        const { back, front } = await readySinglePokemonFrontBack(this.pokedex, this.shiny, this.battle.giga);

        this.battle.img = { back, front };

        return this.battle.img;
    }

}

export default Pokemon;