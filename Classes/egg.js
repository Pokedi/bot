import { Chance } from "chance";
import sql from "../Modules/Database/postgres.js";
import Pokedex from "./pokedex.js";
import randomint from "../Utilities/Misc/randomint.js";

class Egg {

    constructor(obj = { id: 0, egg_id: 0, user_id: 0, count: 0, timestamp: 0 }) {
        this.id = obj.id;
        this.egg_id = obj.egg_id;
        this.user_id = obj.user_id;
        this.count = obj.count || 1000 + randomint(3000);
        this.timestamp = obj.timestamp;
    }

    reduce(i = 1) {
        return this.count = this.count - i;
    }

    async shake(i) {
        return (this.reduce(i) <= 0) ? await this.hatch() : false;
    }

    async hatch() {

        const egg = new Pokedex({ id: this.egg_id });

        await egg.fetchPokemon(sql, 'pks, id');

        if (!egg.pks || !egg.pks.length)
            egg.pks = 'charmander,squirtle,bulbasaur'

        const selectedPokemon = Chance().pickone(egg.pks.split(","));

        await egg.save(sql, { pokemon: selectedPokemon || "eevee" })

        return selectedPokemon;
    }
}

export default Egg;