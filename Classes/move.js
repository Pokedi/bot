import pokeapisql from "../Modules/Database/pokedb.js";
import { ENUM_MOVE_CATEGORY, ENUM_MOVE_TARGET_IDS, ENUM_POKEMON_BASE_STATS_IDS } from "../Utilities/Data/enums.js";

class Move {
    constructor(obj = {}) {
        this.id = obj.id;
        this.name = obj.name
    }

    async search(item, fullSearch) {
        const [id] = fullSearch ? await pokeapisql`SELECT move_id as id FROM pokemon_v2_movename WHERE name ilike ${"%" + item + "%"} LIMIT 1` : await pokeapisql`SELECT id FROM pokemon_v2_move WHERE name ilike ${"%" + item + "%"} ORDER BY generation_id DESC LIMIT 1`;

        if (!id) return false;

        this.id = id.id;

        return this.fetch();
    }

    async fetch(name, price = true) {
        const [move] = await pokeapisql`SELECT mdc.name as damage_type, *, m.id as id, mn.name as name, t.name as type FROM pokemon_v2_move as m JOIN pokemon_v2_type as t ON (t.id = m.type_id) JOIN   pokemon_v2_movename as mn ON (mn.language_id = 9 AND mn.move_id = m.id) JOIN   pokemon_v2_movedamageclass as mdc ON (mdc.id = m.move_damage_class_id) ${(this.name || name) ? pokeapisql`WHERE m.name = ${this.name || name}` : pokeapisql`WHERE m.id = ${this.id}`} ORDER BY m.generation_id DESC LIMIT 1`;
        if (!move)
            return false;
        this.id = move.id;
        if (price) await this.price();
        return Object.assign(this, move),
            await this.metaData(),
            await this.statChanges(move), this;
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
mm.min_turns,
mm.max_turns,
mm.move_meta_category_id,
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

        if (this.meta.move_meta_category_id)
            this.meta.catname = ENUM_MOVE_CATEGORY[this.meta.move_meta_category_id];

        return this.meta;
    }

    async statChanges() {
        if (!this.id)
            return;

        const rows = await pokeapisql`SELECT * FROM pokemon_v2_movemetastatchange WHERE move_id = ${this.id}`;

        const move_target_id = this.move_target_id,
            move_effect_chance = this.move_effect_chance || this.accuracy;

        this.changes = rows.map(x => {
            x.stat = ENUM_POKEMON_BASE_STATS_IDS[x.stat_id];
            x.target_id = x.target_id || move_target_id
            x.target = ENUM_MOVE_TARGET_IDS[x.target_id];
            x.chance = x.chance || move_effect_chance || null;
            return x;
        });

        return this.changes;
    }
}

export default Move;