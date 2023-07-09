import { Chance } from "chance";
import { ENUM_POKEMON_TYPES, POKEMON_NATURES } from "../Utilities/Data/enums.js";
import findPokemon from "../Utilities/Pokemon/findPokemon.js";
import IVCalculator from "../Utilities/Pokemon/IVCalculator.js";

class Pokemon {
    constructor(pokemonObject = { id, user_id, guild_id, pokemon, s_hp, s_atk, s_def, s_spatk, s_spdef, s_spd, s_hp, level, exp, nature, shiny, gender, name, item, m_1, m_2, m_3, m_4 }) {
        if (pokemonObject.pokemon) {
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
            hp: Chance().integer({ min: 0, max: 31 }),

            atk: Chance().integer({ min: 0, max: 31 }),
            def: Chance().integer({ min: 0, max: 31 }),

            spatk: Chance().integer({ min: 0, max: 31 }),
            spdef: Chance().integer({ min: 0, max: 31 }),

            spd: Chance().integer({ min: 0, max: 31 })
        }
        this.level = 1;
        this.exp = 1;
        this.nature = Chance().pickone(POKEMON_NATURES)
        this.moves = Chance().shuffle(this.getAvailableMoves(base)).splice(0, 4);
        this.types = this.convertTypes(base.types);
        Object.assign(this, mergingObject);
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
            name: this.gender,
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
}

export default Pokemon;