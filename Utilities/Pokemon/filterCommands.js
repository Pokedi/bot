import filterPokemon from "./filterPokemon.js";

const filterCommands = {
    // Name-based Filter
    "name": (list = [], value) => {
        return list.filter(x => x.pokemon == value.toLowerCase() || x.pokemon.replace(/-/gmi, ' ').startsWith(value.toLowerCase()));
    },
    // Nickname Filter
    "nickname": (list = [], value = '') => {
        return list.filter(x = x.name && x.name.toLowerCase() == value.toLowerCase());
    },
    // Eeveelution Filter - cuz why not?
    "eeveelution": (list = []) => {
        let eevees = ["vaporeon", "jolteon", "flareon", "umbreon", "leafeon", "sylveon", "glaceon", "espeon", "equilleon"];
        return list.filter(x => eevees.includes(x.pokemon));
    },
    // Ultra Beasts filter
    "ub": (list = []) => {
        const allUltraBeasts = filterPokemon(x => x.legendary == "ub").map(x => x._id);
        return list.filter(x => allUltraBeasts.includes(x.pokemon))
    },
    // Legendary Filter
    "legendary": (list = []) => {
        const allLegendaries = filterPokemon(x => ["legendary", !0, "nonspawn-legendary"].includes(x.legendary)).map(x => x._id);
        return list.filter(x => allLegendaries.includes(x.pokemon))
    },
    // Mythical Filter
    "mythic": (list = []) => {
        const allMythicals = filterPokemon(x => ["mythical", "nonspawn-mythical"].includes(x.legendary)).map(x => x._id);
        return list.filter(x => allMythicals.includes(x.pokemon))
    },
    // Alola Filter
    "alola": (list = []) => {
        const allAlolas = filterPokemon(x => "alola" == x.region).map(x => x._id);
        return list.filter(x => allAlolas.includes(x.pokemon));
    },
    // Galar Filter
    "galar": (list = []) => {
        const allGalars = filterPokemon(x => "galar" == x.region).map(x => x._id);
        return list.filter(x => allGalars.includes(x.pokemon));
    },
    // Shiny Filter
    "shiny": (list = []) => {
        return list.filter(x => x.shiny);
    },
    // Favorite Filter
    "fav": (list = []) => {
        return list.filter(x => x.fav);
    },
    // Mega Filter
    "mega": (list = []) => {
        return list.filter(x => x.mega);
    },
    // Tri-Stat filter
    "tri": (list = [], value = '') => {
        return list.filter(x => ["hp", "atk", "def", "spatk", "spdef", "spd"].filter(u => x["s_" + u] == parseInt(value || 31)).length >= 3)
    },
    "qua": (list = [], value = '') => {
        return list.filter(x => ["hp", "atk", "def", "spatk", "spdef", "spd"].filter(u => x["s_" + u] == parseInt(value || 31)).length >= 4)
    },
    "iv": (list = [], value = '') => {
        return list.filter(pk => {
            let [v, a] = value.match(/([><\d]+)/g);
            const totalIV = ((pk.s_hp + pk.s_atk + pk.s_def + pk.s_spatk + pk.s_spd + pk.s_spdef) / 186) * 100;
            if (v == ">")
                return totalIV >= (a || 20);
            if (v == "<")
                return totalIV <= (a || 20);
            if (v && !a)
                return totalIV == v;
        });
    },
    "egg": (list = []) => {
        return list.filter(x => x.pokemon == "egg");
    }
}

// IV based Filter
const IVs = ["hp", "atk", "def", "spatk", "spdef", "spd"];

IVs.forEach(y => {
    filterCommands[y] = (list = [], value = '') => {
        return list.filter(x => {
            let [v, a] = value.match(/([><\d]+)/g);
            if (v == ">")
                return x["s_" + y] > (a || 20);
            if (v == "<")
                return x["s_" + y] < (a || 20);
            if (v && !a)
                return x["s_" + y] == (a || 20);
        })
    }
});

function checkFilter(list, query = "") {
    const simplifiedQuery = query.split(/(--\w+|—\w+)/gim).map(x => x.trim()).filter(x => x);

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
        list = filterCommands[cleanedCommand](list, value);
    }

    // Remove eggs if no command exists
    if (!simplifiedQuery.includes("--egg")) list = list.filter(x => x.pokemon != "egg");

    return list;
}

export default checkFilter;