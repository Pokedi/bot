import pokemon from "../Data/pokemon.json" assert {type: "json"};

function findPokemon(item, fullSearch = false) {
    if (!item) return pokemon[parseInt(Math.random() * pokemon.length)];
    if (typeof item == 'string') {
        return pokemon.find(x => x._id == item || fullSearch && (new RegExp(item).test(x.name) || x.alt && Object.entries(x.alt).find(z => z[1].find(y => new RegExp(y).test(item)))));
    }
}

export default findPokemon;