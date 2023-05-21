const ENUM_POKEMON_TYPES = {
    "g": "grass",
    "p": "poison",
    "f": "fire",
    "w": "water",
    "b": "bug",
    "fl": "flying",
    "ps": "psychic",
    "r": "rock",
    "i": "ice",
    "gh": "ghost",
    "dr": "dragon",
    "da": "dark",
    "n": "normal",
    "e": "electric",
    "gr": "ground",
    "fr": "fairy",
    "fi": "fighting",
    "s": "steel",
    "u": "unknown",
    "x": "ultimate"
}

const POKEMON_NATURES = ["hardy", "lonely", "brave", "adamant", "naughty", "bold", "docile", "relaxed", "impish", "lax", "timid", "hasty", "serious", "jolly", "naive", "modest", "mild", "quiet", "bashful", "rash", "calm", "gentle", "sassy", "careful", "quirky"];

function reverseENUM(ENUM = {}, item) {
    return Object.entries(ENUM).find(x => x[1] == item)[0];
}

export { POKEMON_NATURES, ENUM_POKEMON_TYPES, reverseENUM };