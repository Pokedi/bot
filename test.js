import prisma from "./Services/Database/index.js";

const j = await prisma.$queryRaw`SELECT idx, pokemon, ((cast(s_hp + s_atk + s_def + s_spatk + s_spd + s_spdef as DECIMAL) / 186) * 100) as totalIV FROM pokemon WHERE user_id = ${BigInt('688446585524584502')} AND pokemon is distinct from 'egg' ORDER BY totalIV desc OFFSET 0 LIMIT 10`;

console.log(j);