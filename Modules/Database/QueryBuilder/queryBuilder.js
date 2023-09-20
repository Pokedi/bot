import postgres from "../postgres.js"
import builder from "sql-query-generator";

builder.use("postgres");

class queryBuilder {
    /**
     * Query Builder - Allow easier Queries
     */
    constructor() {

    }

    Pokemon() {
        this.table = "pokemon";
        return this;
    }

    User() {
        this.table = "users";
        return this;
    }

    columns(cols = "*") {
        this.cols = cols;
        return this;
    }

    select() {
        return builder.select(this.table, this.cols || "*");
    }

    async findOne(query) {

        query = query.limit(1);

        if (!this.table) return console.error("No table selected"), false;

        const [row] = await postgres.unsafe(query.text, query.values);

        return row;
    }
}

export default queryBuilder;