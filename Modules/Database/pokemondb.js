import { config } from "dotenv";
import postgres from "postgres";

config({ override: true, quiet: true });

const pokeapisql = postgres({
    hostname: process.env.DATABASE_HOST,
    database: "pokeapi",
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
});

export default pokeapisql;