import Pokemon from "./Classes/pokemon.js";
import client from "./Services/Database/index.js";
// import allPokemon from "./Utilities/Data/pokemon.js";

const p = new Pokemon({});

client.pokemon.findFirst({
    where: {
        user_id: BigInt()
    }, orderBy: { idx: "desc" }
})