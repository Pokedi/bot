import { config } from "dotenv";
import postgres from "postgres";

config({ override: true, quiet: true });

const pokemondb = postgres({
    hostname: process.env.DATABASE_HOST,
    database: "pokedb",
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
});

export default pokemondb;