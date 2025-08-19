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
    // Hisui Filter
    "hisui": (queryObject) => {
        return queryObject = queryObject.and({ pokemon: "%hisui%" }, 'ilike');
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
    // Gender Bender
    "gender": (queryObject, value = '') => {
        // Check if the value is male or female, m or f, or 1 or 2
        if (value.toLowerCase() === 'male' || value.toLowerCase() === 'm' || value === '2')
            return queryObject = queryObject.and('gender = \'2\'')
        if (value.toLowerCase() === 'female' || value.toLowerCase() === 'f' || value === '1')
            return queryObject = queryObject.and('gender = \'1\'')
        return queryObject = queryObject.and("gender = '3'");
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

// Supported IV stats
const IV_STATS = ["hp", "atk", "def", "spatk", "spdef", "spd"];

// Regex constants
const FLAG_PREFIX = /^(--|—)/;
const OPERATOR_REGEX = /^([<>]=?|=)?\s*(\d+)$/;
const COMMAND_SPLIT_REGEX = /(--\w+|—\w+)/gim;

IV_STATS.forEach(stat => {
    filterCommands[stat] = (queryObject, value = "") => {
        let operator = "=";
        let amount = 20; // default IV threshold

        const match = value.trim().match(OPERATOR_REGEX);
        if (match) {
            if (match[1]) operator = match[1];
            if (match[2]) amount = parseInt(match[2], 10);
        }

        return queryObject.and({ [`s_${stat}`]: amount }, operator);
    };
});

function normalizeQueryFlags(query) {
    let normalized = query;

    // Ensure IV/stat keywords have "--" prefix
    Object.keys(filterCommands).forEach(cmd => {
        const keywordPattern = new RegExp(`\\b${cmd}\\b`, "gi");
        normalized = normalized.replace(keywordPattern, `--${cmd}`);
    });

    return normalized;
}

function attachNameFlag(query) {
    if (query.includes("--name")) return query;

    const pokemonList = filterPokemon(x => x)
        .map(p => p.name.replace(/-/g, " ").toLowerCase());

    const found = pokemonList.find(name =>
        new RegExp(`\\b${name}\\b`, "i").test(query)
    );

    if (found) {
        return query.replace(
            new RegExp(`\\b${found}\\b`, "i"),
            `--name ${found}`
        );
    }

    return query;
}

function parseQueryToCommands(query) {
    const parts = query
        .split(COMMAND_SPLIT_REGEX)
        .map(p => p.trim())
        .filter(Boolean);

    const commands = [];
    for (let i = 0; i < parts.length; i++) {
        if (!FLAG_PREFIX.test(parts[i])) continue;

        const command = parts[i].replace(FLAG_PREFIX, "");
        const value = parts[i + 1] && !FLAG_PREFIX.test(parts[i + 1])
            ? parts[i + 1]
            : "";

        commands.push({ command, value });
    }
    return commands;
}

function dbFilterCommands(
    queryObject = builder.select(
        "pokemon",
        "id, idx, pokemon, s_atk, s_hp, s_def, s_spatk, s_spdef, s_spd, nature, level, shiny, name"
    ),
    query = ""
) {
    queryObject = queryObject.where({ 1: 1 });

    // Normalize input
    query = attachNameFlag(normalizeQueryFlags(query));

    // Default name search if query is plain text
    if (/^\w+/i.test(query) && !query.includes("--name")) {
        queryObject = queryObject.and(
            { pokemon: query, name: query },
            "ilike",
            "or"
        );
    }

    // Remove eggs unless explicitly requested
    if (!query.includes("egg")) {
        queryObject = queryObject.and({ pokemon: "egg" }, "!=");
    }

    // Apply commands
    const commands = parseQueryToCommands(query);
    for (const { command, value } of commands) {
        if (filterCommands[command]) {
            queryObject = filterCommands[command](queryObject, value);
        }
    }

    return queryObject;
}

export default dbFilterCommands;
