import Pokemon from "./Classes/pokemon.js";
import prisma from "./Services/Database/index.js";

const pokemonFound = (new Pokemon(await prisma.pokemon.findFirst({
    orderBy: {
        id: "desc"
    },
    take: 1,
    skip: 0
})));

console.log(pokemonFound.calculateIV("hp"), pokemonFound.calculateIV("spatk"));