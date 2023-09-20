import { config } from "dotenv";
import postgres from "postgres";

config()

const sql = postgres({
    hostname: process.env.DATABASE_HOST,
    database: "pokedi",
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
});

export default sql;