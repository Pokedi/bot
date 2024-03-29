import pokemon from "../Data/pokemon.js";

/**
 * Find Pokemon through JSON
 * @param {String} item
 * @param {Boolean} fullSearch=false
 * @returns {Object} Pokemon JSON
 */
function findPokemon(item, fullSearch = false) {
    if (!item) return pokemon[parseInt(Math.random() * pokemon.length)];
    if (typeof item == 'string') {
        return pokemon.find(x => x._id == item || fullSearch && (new RegExp(item).test(x.name) || x.alt && Object.entries(x.alt).find(z => z[1].find(y => new RegExp(y).test(item)))));
    }
}

export default findPokemon;