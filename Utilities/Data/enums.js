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

const ENUM_TYPE_COLORS = {
    'Normal': 0xA8A77A,
    'Fire': 0xEE8130,
    'Water': 0x6390F0,
    'Electric': 0xF7D02C,
    'Grass': 0x7AC74C,
    'Ice': 0x96D9D6,
    'Fighting': 0xC22E28,
    'Poison': 0xA33EA1,
    'Ground': 0xE2BF65,
    'Flying': 0xA98FF3,
    'Psychic': 0xF95587,
    'Bug': 0xA6B91A,
    'Rock': 0xB6A136,
    'Ghost': 0x735797,
    'Dragon': 0x6F35FC,
    'Dark': 0x705746,
    'Steel': 0xB7B7CE,
    'Fairy': 0xD685AD,
}

export { POKEMON_NATURES, ENUM_POKEMON_TYPES, reverseENUM, ENUM_TYPE_COLORS };