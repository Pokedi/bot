import Pokemon from "./Classes/pokemon.js";
import client from "./Services/Database/index.js";

const data = await client.pokemon.findMany({ where: { user_id: 233823931830632449n } });

console.log(data[data.length - 1]);

// const pokemon = new Pokemon({});

// pokemon.generate(null, { user_id: 233823931830632449n });

// console.log(pokemon.toJSON());

// console.log(await pokemon.save(client));

// console.log(await client.pokemon.findFirst({}));