import prisma from "./Services/Database/index.js";

console.log(await prisma.pokemon.findMany({
    where: {
        user_id: BigInt('688446585524584502')
    },
    select: {
        pokemon: true,
        idx: true
    }
}))