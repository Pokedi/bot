// Import of All Pokemon Files
// import gen1 from "./Pokemon/gen1.json" assert {type: "json"};
// import gen2 from "./Pokemon/gen2.json" assert {type: "json"};
// import gen3 from "./Pokemon/gen3.json" assert {type: "json"};
// import gen4 from "./Pokemon/gen4.json" assert {type: "json"};
// import gen5 from "./Pokemon/gen5.json" assert {type: "json"};
// import gen6 from "./Pokemon/gen6.json" assert {type: "json"};
// import gen7 from "./Pokemon/gen7.json" assert {type: "json"};
// import gen8 from "./Pokemon/gen8.json" assert {type: "json"};
// import custom from "./Pokemon/custom.json" assert {type: "json"};
// import gen9 from "./Pokemon/gen9.json" assert {type: "json"};

import pokemondb from "../../Modules/Database/pokedb.js";

// const allPokemon = [...gen1, ...gen2, ...gen3, ...gen4, ...gen5, ...gen6, ...gen7, ...gen8, ...custom];

const allPokemon = await pokemondb`SELECT * FROM pokemon_dex`;

export default allPokemon;