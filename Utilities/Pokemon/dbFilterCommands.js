import { Chance } from "chance";
import randomint from "../Misc/randomint.js";
import filterPokemon from "./filterPokemon.js";
import builder from "../../Modules/Database/QueryBuilder/queryGenerator.js";
import sql from "../../Modules/Database/postgres.js";
// import pokemondb from "../../Modules/Database/pokedb.js";

const filterCommands = {
    // Name-based Filter
    "name": (queryObject, value = '') => {
        // Add a condition to the queryObject to search for records where the 'pokemon' or 'name' column contains the given value
        // The value is wrapped with '%' to perform a partial match
        // The condition is applied using the 'ilike' operator, which performs a case-insensitive pattern match
        // The 'or' parameter specifies that either the 'pokemon' or 'name' condition should be satisfied
        queryObject = queryObject.and({ pokemon: "%" + value + "%", name: "%" + value + "%" }, 'ilike', 'or');

        // Return the updated queryObject
        return queryObject;
    },
    // Nickname Filter
    "nickname": (queryObject, value = '') => {
        queryObject = queryObject.and({ name: "%" + value + "%" }, 'ilike', 'or');

        return queryObject;
    },
    // Eeveelution Filter - cuz why not?
    "eeveelution": (queryObject) => {
        let eevees = ["vaporeon", "jolteon", "flareon", "umbreon", "leafeon", "sylveon", "glaceon", "espeon", "equilleon"];

        return queryObject = queryObject.and(`pokemon in ('${eevees.join("','")}')`);
    },
    // Ultra Beasts filter
    "ub": (queryObject) => {
        const allUltraBeasts = ["buzzwole", "pheromosa", "xurkitree", "celesteela", "kartana", "guzzlord", "stakataka", "blacephalon", "nihilego"];

        return queryObject = queryObject.and(`pokemon in ('${allUltraBeasts.join("','")}')`);
    },
    // Legendary Filter
    "legendary": (queryObject) => {

        return queryObject = queryObject.and(`pokemon in ('${filterPokemon(x => x.is_legendary).map(x => x._id).join("','")}')`);
    },
    // Mythical Filter
    "mythic": (queryObject) => {
        return queryObject = queryObject.and(`pokemon in ('${filterPokemon(x => x.is_mythical).map(x => x._id).join("','")}')`);
    },
    // Alola Filter
    "alola": (queryObject) => {
        return queryObject = queryObject.and({ pokemon: "%alola%" }, 'ilike');
    },
    // Galar Filter
    "galar": (queryObject) => {
        return queryObject = queryObject.and({ pokemon: "%galar%" }, 'ilike');
    },
    // Shiny Filter
    "shiny": (queryObject) => {
        return queryObject = queryObject.and({ shiny: true });
    },
    // Favorite Filter
    "fav": (queryObject) => {
        return queryObject = queryObject.and({ fav: true });
    },
    // Mega Filter
    "mega": (queryObject) => {
        return queryObject = queryObject.and({ pokemon: "%mega%" }, 'ilike');
    },

    // Tri-Stat Filter
    "tri": (queryObject, value = '') => {

        // Return the updated queryObject with a condition that checks if the sum of the cases satisfies the condition 
        // Each case checks if the corresponding stat (s_atk, s_def, s_hp, s_spatk, s_spdef, s_spd) is greater than or equal to the given value 
        // If the condition is satisfied for at least 3 stats, the overall condition is true 
        return queryObject = queryObject.and(`(
            (case when s_atk >= ${parseInt(value || 20)} then 1 else 0 end) + 
            (case when s_def >= ${parseInt(value || 20)} then 1 else 0 end) + 
            (case when s_hp >= ${parseInt(value || 20)} then 1 else 0 end) +
            (case when s_spatk >= ${parseInt(value || 20)} then 1 else 0 end) +
            (case when s_spdef >= ${parseInt(value || 20)} then 1 else 0 end) +
            (case when s_spd >= ${parseInt(value || 20)} then 1 else 0 end)
        ) >= 3`);

    },
    // Qua-Stat Filter
    "qua": (queryObject, value = '') => {

        // Return the updated queryObject with a condition that checks if the sum of the cases satisfies the condition 
        // Each case checks if the corresponding stat (s_atk, s_def, s_hp, s_spatk, s_spdef, s_spd) is greater than or equal to the given value 
        // If the condition is satisfied for at least 4 stats, the overall condition is true 
        return queryObject = queryObject.and(`(
            (case when s_atk >= ${parseInt(value || 20)} then 1 else 0 end) + 
            (case when s_def >= ${parseInt(value || 20)} then 1 else 0 end) + 
            (case when s_hp >= ${parseInt(value || 20)} then 1 else 0 end) +
            (case when s_spatk >= ${parseInt(value || 20)} then 1 else 0 end) +
            (case when s_spdef >= ${parseInt(value || 20)} then 1 else 0 end) +
            (case when s_spd >= ${parseInt(value || 20)} then 1 else 0 end)
        ) >= 4`);
    },

    // IV Filter
    "iv": (queryObject, value = '') => {

        // Set the initial value of the operator variable to "="
        let operator = "=";

        // Use regular expression to extract the operator and value from the given value
        let [v, a] = value.match(/([><\d]+)/g);

        // Check if the extracted operator is ">" and update the operator variable accordingly
        if (v == ">")
            operator = ">=";

        // Check if the extracted operator is "<" and update the operator variable accordingly
        if (v == "<")
            operator = "<=";

        // Check if the extracted operator exists and the value does not exist, then assign the extracted operator to the value
        if (v && !a)
            a = v;

        // Return the updated queryObject with a condition based on the calculated value and operator
        return queryObject = queryObject.and({ "((CAST(s_atk + s_spatk + s_def + s_spdef + s_spd + s_hp AS FLOAT)/186) * 100)": parseInt(a || 20) }, (operator));
    },

    // Display Eggs 
    "egg": (queryObject) => {
        return queryObject = queryObject.and({ pokemon: "egg" });
    },

    // Custom Filters
    "frog": (queryObject) => {

        // Froggo List
        const frogs = ["ivysaur", "venusaur", "poliwag", "poliwhirl", "poliwrath", "politoed", "lotad", "croagunk", "toxicroak", "tympole", "palpitoad", "seismitoad", "froakie", "frogadier", "greninja"];

        return queryObject = queryObject.and(`pokemon in ('${frogs.join("','")}')`);
    }
}

// IV based Filter
const IVs = ["hp", "atk", "def", "spatk", "spdef", "spd"];

IVs.forEach(y => {
    filterCommands[y] = (queryObject, value = '') => {

        let operator = "="

        let [v, a] = value.match(/([><\d]+)/g);

        if (v == ">")
            operator = ">=";
        if (v == "<")
            operator = "<=";
        if (v && !a)
            a = v;

        return queryObject = queryObject.and({ ["s_" + y]: parseInt(a || 20) }, (operator));

    }
});

function dbFilterCommands(queryObject = builder.select('pokemon', 'id, idx, pokemon, s_atk, s_hp, s_def, s_spatk, s_spdef, s_spd, nature, level, shiny, name'), query = "") {

    // Add default starting value
    queryObject = queryObject.where({ 1: 1 });

    // Default --name filter if not used but other files used
    if (query && /^\w+/gmi.test(query) && !query.includes("--name"))
        queryObject = queryObject.and({ pokemon: query, name: query }, 'ilike');

    const simplifiedQuery = query.split(/(--\w+|—\w+)/gim).map(x => x.trim()).filter(x => x);

    // Remove eggs if no command exists
    if (!simplifiedQuery.includes("--egg"))
        queryObject = queryObject["and"]({ pokemon: 'egg' }, '!=');

    for (let index = 0; index < simplifiedQuery.length; index++) {
        const row = simplifiedQuery[index];
        // isCommand
        if (!(row.startsWith("--") || row.startsWith("—"))) continue;
        // Remove prefixes
        const cleanedCommand = row.split(/--|—/gim)[1];
        // Test command and run if needed
        if (!filterCommands[cleanedCommand]) continue;
        // Get Value if exists
        const value = /--|—/.test(simplifiedQuery[index + 1]) ? '' : simplifiedQuery[index + 1];
        // Clear out Pokemon as it goes
        filterCommands[cleanedCommand](queryObject, value);
    }

    return queryObject;
}

export default dbFilterCommands;