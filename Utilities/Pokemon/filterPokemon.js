import pokemon from "../Data/pokemon.json" assert {type: "json"};


/**
 * Filter Pokemon through JSON
 * @param {Function} callableFunction
 * @returns {[Object]} Pokemon JSON
 */
function filterPokemon(callableFunction = x => !x.legendary) {
    return pokemon.filter(callableFunction);
}

export default filterPokemon;