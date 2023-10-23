import arrayOffset from "../Misc/arrayOffset.js";
import checkFilter from "./filterCommands.js";

function pokemonFilter(list = [], query = "", page, orderBy = 1, orderType) {

    list = checkFilter(list, query);

    // Sorting out the List
    list = list.sort((x, y) => {
        switch (orderBy) {
            case 1:
                return orderType ? x.idx - y.idx : y.idx - x.idx;
            case 2: {
                const a = (((x.s_hp + x.s_atk + x.s_def + x.s_spatk + x.s_spd + x.s_spdef) / 186) * 100);
                const b = (((y.s_hp + y.s_atk + y.s_def + y.s_spatk + y.s_spd + y.s_spdef) / 186) * 100);
                return orderType ? a - b : b - a;
            };
            case 3:
                return orderType ? x.level - y.level : y.level - x.level;
            case 4:
                const textA = x.pokemon.toLowerCase();
                const textB = y.pokemon.toLowerCase();
                if (textA < textB) return orderType ? -1 : 1;
                if (textA > textB) return orderType ? 1 : -1;
                return 0;
        }
    });

    return arrayOffset(list, page).map(x => {
        x.totalIV = x.pokemon == "egg" ? 0 : (((x.s_hp + x.s_atk + x.s_def + x.s_spatk + x.s_spd + x.s_spdef) / 186) * 100).toFixed(2);
        return x;
    });

}

export default pokemonFilter;