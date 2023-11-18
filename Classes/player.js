import builder from "../Modules/Database/QueryBuilder/queryGenerator.js";
import pokemondb from "../Modules/Database/pokedb.js";
import Egg from "./egg.js";
import Pokedex from "./pokedex.js";
import Pokemon from "./pokemon.js";

class Player {
    constructor(info = { id } = {}) {
        this.id = info.id;
        this.bal = info.bal;
        this.disabled = info.disabled;
        this.started = info.started;
        this.staff = info.staff;
        this.order_by = info.order_by || "idx";
        this.selected = info.selected || [];
        this.redeem = info.redeem;
        this.xp_share = info.xp_share;
        this.xp_boost_end = info.xp_boost_end;
        this.hide_levelup = info.hide_levelup;
        this.locale = info.locale;
        this.exp = info.exp || 0;
        this.level = info.level || 1;

        this.character = info.character;
        this.background = info.background || 1;
        this.gender = info.gender;

        // Hatchery
        this.hatchery = [];

        // Guild
        this.guild_id = info.guild_id || null;
    }

    async fetch(postgres) {

        const query = builder.select("users", "*").where({ id: BigInt(this.id), guild_id: this.guild_id });

        const [row] = await postgres.unsafe(query.text, query.values);

        return Object.assign(this, row);
    }

    async fetchColumns(postgres, columns = "*") {

        const query = builder.select("users", columns).where({ id: BigInt(this.id), guild_id: this.guild_id });

        const [row] = await postgres.unsafe(query.text, query.values);

        return Object.assign(this, row);
    }

    async isValid(postgres, id) {
        const [row] = await postgres`SELECT started, id FROM users WHERE id = ${id || this.id}`;

        return row;
    }

    async fetchIncome(postgres) {
        const query = builder.select("users", ["bal", "redeem"]).where({ id: BigInt(this.id), guild_id: this.guild_id });

        const [row] = await postgres.unsafe(query.text, query.values);

        if (!row) return { bal: 0, redeem: 0 };

        return row;
    }

    toJSON() {
        return {
            bal: this.bal,
            disabled: this.disabled,
            started: this.started,
            staff: this.staff,
            order_by: this.order_by,
            selected: this.selected,
            redeem: this.redeem,
            xp_share: this.xp_share,
            xp_boost_end: this.xp_boost_end,
            hide_levelup: this.hide_levelup,
            locale: this.locale,
            exp: this.exp,
            level: this.level,
            guild_id: this.guild_id
        }
    }

    async save(postgres, data) {
        if (!this.id) return false;

        const query = builder.update("users", data || this.toJSON()).where({ id: BigInt(this.id), guild_id: this.guild_id });

        const [row] = await postgres.unsafe(query.text, query.values);

        return row;
    }

    async levelUp(postgres) {

        this.exp += 2;

        const query = builder.update("users", {
            level: ((this.level || 1) * 30 <= this.exp) ? ++this.level : this.level,
            exp: ((this.level || 1) * 30 <= this.exp) ? 0 : this.exp
        }).where({ id: BigInt(this.id), guild_id: this.guild_id });

        await postgres.unsafe(query.text, query.values);

        return ((this.level || 1) * 30 <= this.exp);
    }

    // Pokemon Level up Function via User
    async pokemonLevelUp(postgres, msg, level) {

        // Ignore if no Pokemon selected
        if (!this.selected[0]) return false;

        // Ready Pokemon Class
        const pokemon = new Pokedex({ id: this.selected[0] });

        // Fetch Pokemon
        await pokemon.fetchPokemon(postgres, "level, pokemon, exp, user_id, gender, item, id");

        // Check Pokemon
        if (!pokemon.user_id || pokemon.pokemon == "egg") return false;

        // Ready Pokemon
        await pokemon.getColumnsByID('id, _id, base_experience', { _id: pokemon.pokemon });

        // Level Up
        return await pokemon.levelUp(postgres, msg, level);
    }

    // Set Trade
    async setTrading(redis, withUser = 0) {
        if (!withUser) return true;
        return await redis.set(this.id + '-trade', withUser);
    }

    // Stops User Trade
    async stopTrading(redis) {
        return await redis.del(this.id + '-trade');
    }

    // isTrading?
    async isTrading(redis) {
        return await redis.get(this.id + '-trade');
    }

    // Set User Duels True
    async setOnGoingDuels(redis) {
        return await redis.set(this.id + '-duel', Date.now());
    }

    // Set User Market True
    async setOnGoingMarket(redis) {
        return await redis.set(this.id + '-market', Date.now());
    }

    // isMarketing?
    async isMarketing(redis) {
        const isMarket = await redis.get(this.id + '-market');
        return isMarket && Date.now() - isMarket < 6e5 ? isMarket : false;
    }

    // Remove User Duel state from Redis
    async removeMarket(redis) {
        return await redis.del(this.id + '-market');
    }

    // Remove User Duel state from Redis
    async removeDuelsState(redis) {
        return await redis.del(this.id + '-duel');
    }

    // isDueling?
    async isInDuel(redis) {
        const isDueling = await redis.get(this.id + '-duel');
        return isDueling && Date.now() - isDueling < 5 * 60000 ? isDueling : false;
    }

    // Check Count Pokemon
    async countPokemon(postgres) {

        const query = builder.select("pokemon", "count(true) as count").where({ user_id: BigInt(this.id) });

        const [row] = await postgres.unsafe(query.text, query.values);

        return row.count;
    }

    // Check Count Pokemon
    async countDex(postgres) {

        const [{ count }] = await postgres`SELECT count(true) as count FROM dex WHERE user_id = ${this.id}`;

        return count;
    }

    async fetchPokemon(postgres) {

        const rows = this.selected.length ? await postgres`SELECT * FROM pokemon WHERE id in ${postgres(this.selected)}` : await postgres`SELECT * FROM pokemon WHERE user_id = ${this.id} LIMIT 6`;

        if (!rows.length) return this.pokemon = [];

        const pokemon = this.selected.map(x => new Pokedex(rows.find(y => y.id == x) || {})).filter(x => x.id);

        this.pokemon = pokemon;

        return pokemon;
    }

    async fetchPokemonByIDX(idx = 1, postgres) {
        const [row] = await postgres`SELECT * FROM pokemon WHERE idx = ${idx}`;

        if (!row) return [];

        return new Pokemon(row);
    }

    async fetchInventory(postgres, full = false) {
        this.inventory = await postgres`SELECT * FROM user_inventory WHERE user_id = ${this.id}`;

        if (!this.inventory.length) return [];

        if (full) {
            const inventoryNames = await pokemondb`SELECT name FROM pokemon_v2_itemname WHERE item_id in ${pokemondb(this.inventory.map(x => x.item_id))} AND language_id = 9`;
            this.inventory = this.inventory.map(x => {
                x.name = inventoryNames.find(y => y.item_id == x.id)?.name || "Item #" + x.id;
                return x;
            });
        }

        return this.inventory;
    }

    async fetchHatchery(postgres, slot) {
        const nests = postgres`SELECT h.slot, h.egg_id, h.count, h.id, p.idx FROM hatchery as h
        LEFT JOIN pokemon as p ON (p.id = h.egg_id)
        WHERE h.user_id = ${this.id} ${slot ? postgres`AND slot = ${slot}` : postgres``}`;

        this.hatchery = (await nests).map(x => new Egg(x));

        return this.hatchery;
    }

    // Battle Section
    readyBattleMode() {
        // Battle Mode
        this.battle = {
            // Selected Pokemon
            selected: 0,
            // Inventory
            inv: {},
            // Giga Boolean
            giga: false
        }

        return this.battle;
    }

    async lastIDX(postgres) {
        const [row] = postgres`SELECT idx FROM pokemon WHERE user_id = ${this.id} ORDER BY idx desc`;

        return row.idx ? row.idx : 0;
    }
}

export default Player;