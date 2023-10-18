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
    "sh": "shadow",
    "x": "ultimate"
}

const ENUM_POKEMON_FULL_TYPES_ID = {
    "1": "normal", "2": "fighting", "3": "flying", "4": "poison", "5": "ground", "6": "rock", "7": "bug", "8": "ghost", "9": "steel", "10": "fire", "11": "water", "12": "grass", "13": "electric", "14": "psychic", "15": "ice", "16": "dragon", "17": "dark", "18": "fairy", "10001": "unknown", "10002": "shadow"
}

const ENUM_POKEMON_TYPES_ID = {
    "1": "n", "2": "fi", "3": "fl", "4": "p", "5": "gr", "6": "r", "7": "b", "8": "gh", "9": "s", "10": "f", "11": "w", "12": "g", "13": "e", "14": "ps", "15": "i", "16": "dr", "17": "da", "18": "fr", "10001": "un", "10002": "sh"
}

const POKEMON_NATURES = ["hardy", "lonely", "brave", "adamant", "naughty", "bold", "docile", "relaxed", "impish", "lax", "timid", "hasty", "serious", "jolly", "naive", "modest", "mild", "quiet", "bashful", "rash", "calm", "gentle", "sassy", "careful", "quirky"];

const ENUM_POKEMON_BASE_STATS = {
    "hp": "hp",
    "atk": "attack",
    "def": "defense",
    "spatk": "special-attack",
    "spdef": "special-defense",
    "spd": "speed",
    "acc": "accuracy",
    "eva": "evasion"
}

const ENUM_POKEMON_BASE_STATS_IDS = {
    1: "hp",
    2: "attack",
    3: "defense",
    4: "special-attack",
    5: "special-defense",
    6: "speed",
    7: "accuracy",
    8: "evasion"
}

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

export { ENUM_POKEMON_TYPES_ID, ENUM_POKEMON_FULL_TYPES_ID, ENUM_POKEMON_BASE_STATS_IDS, POKEMON_NATURES, ENUM_POKEMON_TYPES, reverseENUM, ENUM_TYPE_COLORS, ENUM_POKEMON_BASE_STATS };