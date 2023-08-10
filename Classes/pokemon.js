import { Chance } from "chance";
import { ENUM_POKEMON_TYPES, POKEMON_NATURES } from "../Utilities/Data/enums.js";
import findPokemon from "../Utilities/Pokemon/findPokemon.js";
import IVCalculator from "../Utilities/Pokemon/IVCalculator.js";
import filterPokemon from "../Utilities/Pokemon/filterPokemon.js";
import randomint from "../Utilities/Misc/randomint.js";
import spawnImage from "../Utilities/Pokemon/spawnImage.js";
import time_gradient from "../Utilities/Misc/time_gradient.js";
const chance = Chance();

class Pokemon {
    constructor(pokemonObject = { id, user_id, guild_id, pokemon, s_hp, s_atk, s_def, s_spatk, s_spdef, s_spd, s_hp, level, exp, nature, shiny, gender, name, item, m_1, m_2, m_3, m_4 }) {
        if (pokemonObject?.pokemon) {
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
        }
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
        Object.assign(this, mergingObject);
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
    async spawnToChannel(msg) {
        // Return spawnImage-generated Image
        return msg.channel.send({
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

    async save(prisma) {
        if (!prisma) return false;
        if (!this.id) return await prisma.pokemon.create({ data: this.toJSON() });
        return await prisma.pokemon.update({
            data: this.toJSON(),
            where: {
                id: this.id
            }
        });
    }

    async fetchPokemon(prisma) {
        if (!prisma) return false;
        return Object.assign(this, new Pokemon(await prisma.pokemon.findFirst({ where: { id: this.id } }) || {}));
    }

    getDetails() {
        return findPokemon(this.pokemon) || {};
    }

    getNextLevelEXP() {
        return calculateNextLevelEXP(this.level, this.getDetails().base_exp);
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

    async release(prisma) {
        return await prisma.pokemon.update({
            where: {
                id: this.id
            },
            data: {
                user_id: null
            }
        })
    }

    async addToUserDex(prisma) {
        return await prisma.dex.upsert({
            where: {
                user_id_pokemon: {
                    user_id: this.user_id,
                    pokemon: this.pokemon
                }
            },
            update: {
                count: { increment: this.shiny ? 0 : 1 },
                shinies: { increment: this.shiny ? 1 : 0 },
                unclaimed_normal: { increment: this.shiny ? 0 : 1 },
                unclaimed_shinies: { increment: this.shiny ? 1 : 0 }
            },
            create: {
                user_id: this.user_id,
                pokemon: this.pokemon,
                count: this.shiny ? 0 : 1,
                shinies: this.shiny ? 1 : 0,
                giga: 0,
                unclaimed_normal: this.shiny ? 0 : 1,
                unclaimed_shinies: this.shiny ? 1 : 0
            }
        });
    }
}

export default Pokemon;