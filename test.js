import Player from "./Classes/player.js";
import Pokemon from "./Classes/pokemon.js";
import client from "./Services/Database/index.js";
import redisClient from "./Services/Database/redis.js";

// console.log(await client.product.create({
//     data: {
//         id: "griseous orb",
//         name: "Griseous Orb",
//         description: "A shining gem to be held by Giratina. It boosts the power of Giratina’s Dragon- and Ghost-type moves.",
//         cost: 3000,
//         type: "form-change-item"
//     }
// }))

// redisClient.set('test-trade', 1);

console.log(await redisClient.get('test-trade'));
// console.log(await redisClient.del('test-trade'));
// console.log(await redisClient.get('test-trade'));

process.exit(1);