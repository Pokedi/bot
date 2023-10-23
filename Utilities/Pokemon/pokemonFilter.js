import builder from "../../Modules/Database/QueryBuilder/queryGenerator.js";
import sql from "../../Modules/Database/postgres.js";
import arrayOffset from "../Misc/arrayOffset.js";
import dbFilterCommands from "./dbFilterCommands.js";

async function pokemonFilter(user_id, query = "", page = 0, orderBy = "idx", orderType = "asc") {

    // Return SUM of Pokemon based on Conditions
    if (page == -1) {
        const { text, values } = dbFilterCommands(builder.select('pokemon', 'count(true) as count'), query).and(user_id ? `user_id = ${user_id}` : `1=1`);

        let [{ count }] = await sql.unsafe(text, values);

        return count;
    }

    if (query.includes("random"))
        orderBy = "random()", orderType = "";

    const { text, values } = dbFilterCommands(undefined, query).and(user_id ? `user_id = ${user_id}` : `1=1`).orderby(orderBy + " " + orderType).limit(20, page * 20);

    let list = await sql.unsafe(text, values);

    return list.map(x => {
        x.totalIV = x.pokemon == "egg" ? 0 : (((x.s_hp + x.s_atk + x.s_def + x.s_spatk + x.s_spd + x.s_spdef) / 186) * 100).toFixed(2);
        return x;
    });

}

export default pokemonFilter;