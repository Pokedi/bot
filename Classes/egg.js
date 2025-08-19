import { Chance } from "chance";
import sql from "../Modules/Database/postgres.js";
import Pokedex from "./pokedex.js";
import randomint from "../Utilities/Misc/randomint.js";

class Egg {

    constructor(obj = { id: 0, slot: 0, idx: 0, egg_id: 0, user_id: 0, count: 0, timestamp: 0 }) {
        this.id = obj.id;
        this.idx = obj.idx;
        this.slot = obj.slot;
        this.egg_id = obj.egg_id;
        this.user_id = obj.user_id;
        this.count = obj.count || 1000 + randomint(3000);
        this.timestamp = obj.timestamp;
    }

    reduce(i = 1) {
        return this.count = this.count - i;
    }

    async shake(i) {
        if (this.id && this.egg_id && this.count > 0 && (this.count % 200) == 0) await sql`UPDATE hatchery SET count = ${this.count} WHERE id = ${this.id}`;
        return (this.id && this.egg_id && this.reduce(i) <= 0) ? await this.hatch() : false;
    }

    async hatch() {

        const egg = new Pokedex({ id: this.egg_id });

        await egg.fetchPokemon(sql, 'pokemon, pks, id');

        if (egg.pokemon != "egg")
            return await this.remove(), false;

        if (!egg.pks || !egg.pks.length)
            egg.pks = 'charmander,squirtle,bulbasaur'

        const selectedPokemon = Chance().pickone(egg.pks.split(","));

        egg.pokemon = selectedPokemon || "eevee";

        egg.pks = '';

        await egg.getPokemonSpecies(egg.pokemon);

        await egg.generateV2(undefined, { level: 1 });

        await egg.save(sql);

        await this.remove();

        return egg;
    }

    async remove() {
        return await sql`UPDATE hatchery SET egg_id = null, count = 0 WHERE id = ${this.id}`, this.egg_id = 0, this.count = 0;
    }
}

export default Egg;