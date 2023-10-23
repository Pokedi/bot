import pokeapisql from "../Modules/Database/pokedb.js";

class Move {
    constructor(obj = {}) {
        this.id = obj.id;
        this.name = obj.name
    }

    async search(item) {
        const [{ id }] = await pokeapisql`SELECT id FROM pokemon_v2_move WHERE name ilike ${"%" + item + "%"} ORDER BY generation_id DESC LIMIT 1`;

        if (!id) return false;

        this.id = id;

        return this.fetch();
    }

    async fetch(name, price = true) {
        const [move] = await pokeapisql`SELECT mdc.name as damage_type, *, m.id as id, mn.name as name, t.name as type FROM pokemon_v2_move as m JOIN pokemon_v2_type as t ON (t.id = m.type_id) JOIN   pokemon_v2_movename as mn ON (mn.language_id = 9 AND mn.move_id = m.id) JOIN   pokemon_v2_movedamageclass as mdc ON (mdc.id = m.move_damage_class_id) ${(this.name || name) ? pokeapisql`WHERE m.name = ${this.name || name}` : pokeapisql`WHERE m.id = ${this.id}`} ORDER BY m.generation_id DESC LIMIT 1`;
        this.id = move.id;
        if (price) await this.price();
        await this.metaData();
        return Object.assign(this, move);
    }

    async price() {
        const [movePrice] = await pokeapisql`SELECT cost FROM pokemon_v2_machine as ma
        JOIN  public.pokemon_v2_item as i ON (ma.item_id = i.id)
        WHERE move_id = ${this.id} ORDER BY version_group_id DESC LIMIT 1;`
        this.cost = movePrice?.cost || 0;
        return this.cost;
    }

    async metaData() {
        const [meta] = await pokeapisql`SELECT 
mma.name as ailment,
mm.min_hits,
mm.max_hits,
mm.crit_rate,
mm.ailment_chance,
mm.healing,
mm.drain,
mft.flavor_text as description

FROM pokemon_v2_movemeta as mm
JOIN pokemon_v2_movemetaailment AS mma ON (mma.id = mm.move_meta_ailment_id)
JOIN pokemon_v2_moveflavortext AS mft ON (mm.move_id = mft.move_id AND language_id = 9)
WHERE mm.move_id = ${this.id};`

        this.meta = meta;

        return this.meta;
    }
}

export default Move;