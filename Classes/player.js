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
    }

    async fetch(prisma) {
        return Object.assign(this, await prisma.users.findUnique({ where: { id: BigInt(this.id) } }));
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

    async save(prisma, data) {
        if (!this.id) return false;
        return prisma.users.update({
            where: {
                id: this.id
            },
            data: data || this.toJSON()
        })
    }

    async levelUp(prisma) {
        console.log("Leveling up a User");
        this.exp += 2;
        return await prisma.users.update({
            where: {
                id: this.id
            },
            data: {
                level: ((this.level || 1) * 30 <= this.exp) ? ++this.level : this.level,
                exp: ((this.level || 1) * 30 <= this.exp) ? 0 : this.exp
            }
        }), ((this.level || 1) * 30 > this.exp);
    }

    // Pokemon Level up Function via User
    async pokemonLevelUp(prisma, msg, level) {

        // Ignore if no Pokemon selected
        if (!this.selected[0]) return false;

        // Ready Pokemon Class
        const pokemon = new Pokemon({ id: this.selected[0] });

        // Fetch Pokemon
        await pokemon.fetchPokemon(prisma);

        // Check Pokemon
        if (!pokemon.user_id) return false;

        // Level Up
        return await pokemon.levelUp(prisma, msg, level);
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
}

export default Player;