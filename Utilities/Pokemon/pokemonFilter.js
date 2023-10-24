import builder from "../../Modules/Database/QueryBuilder/queryGenerator.js";
import sql from "../../Modules/Database/postgres.js";
import arrayOffset from "../Misc/arrayOffset.js";
import dbFilterCommands from "./dbFilterCommands.js";

async function pokemonFilter(user_id, query = "", page = 0, orderBy = "idx", orderType = "asc") {

    // Check if the page number is -1
    if (page == -1) {
        // Call the dbFilterCommands function with the select query and user_id condition
        const { text, values } = dbFilterCommands(builder.select('pokemon', 'count(true) as count'), query).and(user_id ? `user_id = ${user_id}` : `1=1`);
        // Execute the SQL query and retrieve the count of Pokemon
        let [{ count }] = await sql.unsafe(text, values);
        // Return the count of Pokemon
        return count;
    }

    // Check if the query includes the word "random"
    if (query.includes("random")) {
        // Set the orderBy variable to "random()" and orderType to an empty string
        orderBy = "random()";
        orderType = "";
    }

    // Call the dbFilterCommands function with undefined select query and user_id condition, and apply orderBy and limit
    const { text, values } = dbFilterCommands(undefined, query).and(user_id ? `user_id = ${user_id}` : `1=1`).orderby(orderBy + " " + (orderType || "asc")).limit(20, page * 20);

    // Execute the SQL query and retrieve the list of Pokemon
    let list = await sql.unsafe(text, values);

    // Map through the list and calculate the totalIV for each Pokemon
    return list.map(x => {
        x.totalIV = x.pokemon == "egg" ? 0 : (((x.s_hp + x.s_atk + x.s_def + x.s_spatk + x.s_spd + x.s_spdef) / 186) * 100).toFixed(2);
        return x;
    });

}

export default pokemonFilter;