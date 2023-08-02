import prisma from "./Services/Database/index.js";

// import postgres from "postgres";

(async () => {
    const d = Date.now();

    // const foundPokemon = prisma.$queryRaw`SELECT * FROM pokemon WHERE user_id = ${BigInt('423977907866566666')}`;

    const foundPokemon = prisma.pokemon.findMany({
        where: {
            user_id: BigInt('423977907866566666')
        }
    });

    // console.log(foundPokemon)

    console.log("Took " + foundPokemon.length + " Pokemon and it took " + ((Date.now() - d) / 1000) + " seconds");
})()

// const sql = postgres({
//     hostname: "phx-intel-b4.electrohaxz-hosting",
//     database: "pokedi",
//     user: "root",
//     password: "9X9ZNYZwrQzmGsAzrm47PaKspTmB7ym9",
//     port: 9044,
    // host: "postgresql://root:9X9ZNYZwrQzmGsAzrm47PaKspTmB7ym9@phx-intel-b4.electrohaxz-hosting:9044/pokedi"
// });

// (async () => {
//     const d = Date.now();

//     const foundPokemon = await sql`SELECT * FROM pokemon WHERE user_id = ${BigInt('423977907866566666')}`;

//     console.log("Took " + foundPokemon.length + " Pokemon and it took " + ((Date.now() - d) / 1000) + " seconds");
// })()