import builder from "../Modules/Database/QueryBuilder/queryGenerator.js";
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
    }

    async fetch(postgres) {

        const query = builder.select("users", "*").where({ id: BigInt(this.id) });

        const [row] = await postgres.unsafe(query.text, query.values);

        return Object.assign(this, row);
    }

    async fetchIncome(postgres) {
        const query = builder.select("users", ["bal", "redeem"]).where({ id: BigInt(this.id) });

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
            level: this.level
        }
    }

    async save(postgres, data) {
        if (!this.id) return false;

        const query = builder.update("users", data || this.toJSON()).where({ id: BigInt(this.id) });

        const [row] = await postgres.unsafe(query.text, query.values);

        return row;
    }

    async levelUp(postgres) {

        this.exp += 2;

        const query = builder.update("users", {
            level: ((this.level || 1) * 30 <= this.exp) ? ++this.level : this.level,
            exp: ((this.level || 1) * 30 <= this.exp) ? 0 : this.exp
        }).where({ id: BigInt(this.id) });

        await postgres.unsafe(query.text, query.values);

        return ((this.level || 1) * 30 <= this.exp);
    }

    // Pokemon Level up Function via User
    async pokemonLevelUp(postgres, msg, level) {

        // Ignore if no Pokemon selected
        if (!this.selected[0]) return false;

        // Ready Pokemon Class
        const pokemon = new Pokemon({ id: this.selected[0] });

        // Fetch Pokemon
        await pokemon.fetchPokemon(postgres);

        // Check Pokemon
        if (!pokemon.user_id) return false;

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

        const query = builder.select("dex", "count(true) as count").where({ user_id: BigInt(this.id) });

        const [row] = await postgres.unsafe(query.text, query.values);

        return row;
    }

    async fetchPokemon(postgres) {

        const rows = this.selected.length ? await postgres`SELECT * FROM pokemon WHERE id in ${postgres(this.selected)}` : await postgres`SELECT * FROM pokemon WHERE user_id = ${this.id} LIMIT 6`;

        if (!rows.length) return this.pokemon = [];

        const pokemon = this.selected.map(x => new Pokemon(rows.find(y => y.id == x)||{})).filter(x => x.id);

        this.pokemon = pokemon;

        return pokemon;
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
}

export default Player;