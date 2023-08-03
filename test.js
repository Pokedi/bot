import Pokemon from "./Classes/pokemon.js";
import client from "./Services/Database/index.js";

const pokemon = new Pokemon(await client.pokemon.findFirst({
    where: {
        idx: 1 - 1,
        user_id: BigInt('688446585524584502')
    }
}));

console.log(pokemon);