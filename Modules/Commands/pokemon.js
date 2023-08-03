import { SlashCommandBuilder } from "discord.js";
import capitalize from "../../Utilities/Misc/capitalize.js";
import pokemonFilter from "../../Utilities/Pokemon/pokemonFilter.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .addNumberOption(option => option.setName('page').setDescription('Page of Pokemon list'))
        .addNumberOption(option => option.setName('orderby').setDescription('1 - idx; 2 - iv; 3 - level'))
        .addBooleanOption(option => option.setName('ordertype').setDescription('true - asc (default), false - desc'))
        .addStringOption(option => option.setName('query').setDescription('Enter the needed query. [Read Query cheatsheet for more help]'))
        .setName('pokemon')
        .setDescription('List your Pokemon'),
    async execute(msg) {
        const page = (msg.options.getNumber("page") || 1) - 1;
        const orderBy = (msg.options.getNumber("orderby") || 1);
        const query = msg.options.getString("query");
        const orderType = msg.options.getBoolean("ordertype");

        // Query all Pokemon from Postgres
        const allPokemon = await msg.client.postgres`SELECT * FROM pokemon WHERE user_id = ${msg.user.id}`;

        // Pokemon that passed Filter
        const passedFilteredPokemon = pokemonFilter(allPokemon, query, page, orderBy, orderType);

        // Design value
        let numberLength = (passedFilteredPokemon.map(x => x.idx).sort((x, y) => y - x)[0]).toString().length;

        await msg.reply({
            embeds: [{
                title: 'Your Pokemon',
                description: `${passedFilteredPokemon.map(x => {
                    return `\`${" ".repeat(numberLength - (x.idx + 1).toString().length)}${x.idx + 1}\`　　${capitalize(x.pokemon)} ${x.name ? "\"**" + capitalize(x.name) + "**\"" : ""}${x.shiny ? " ⭐" : ""}　•　Level: ${x.level}　•　**IV**: ${x.totalIV}%`;
                }).join("\n")}`,
                footer: {
                    text: `Showing ${passedFilteredPokemon[0].idx + 1} - ${passedFilteredPokemon[0].idx + 20} of Pokémon matching this search. [ Page ${page || 1} ]`
                },
                color: 44678
            }]
        });
    }
}

/*
const foundPokemon = orderBy != 2 ? await msg.client.prisma.pokemon.findMany({
    where: {
        user_id: BigInt(msg.user.id),
        pokemon: { not: "egg" }
    },
    orderBy: (() => {
        switch (orderBy) {
            case 1:
            default:
                return {
                    idx: orderType
                };
            case 2:
                return {
                    id: orderType
                }
            case 3:
                return {
                    level: orderType
                }
        }
    })(),
    take: 20,
    skip: page > 0 ? page * 20 : 0,
    select: {
        idx: true,
        pokemon: true,
        name: true,
        level: true,
        s_atk: true,
        s_def: true,
        s_hp: true,
        s_spatk: true,
        s_spd: true,
        s_spdef: true,
        shiny: true
    }
}) : await msg.client.postgres`SELECT idx, pokemon, name, level, s_atk, s_def, s_hp, s_spatk, s_spd, s_spdef, shiny, ((cast(s_hp + s_atk + s_def + s_spatk + s_spd + s_spdef as decimal) / 186) * 100) as totalIV FROM pokemon WHERE user_id = ${BigInt(msg.user.id)} AND pokemon is distinct from 'egg' ORDER BY totalIV desc OFFSET ${page > 0 ? page * 20 : 0} LIMIT 20`;

if (!foundPokemon.length) return msg.reply({ ephemeral: true, content: "No pokemon exist with those parameters..." });

let numberLength = (foundPokemon.map(x=>x.idx).sort((x, y) => y - x)[0]).toString().length;

// Classic
await msg.reply({
    embeds: [{
        title: 'Your Pokemon',
        description: `${foundPokemon.map(x => {
            return `\`${" ".repeat(numberLength - x.idx.toString().length)}${x.idx + 1}\`　　${capitalize(x.pokemon)} ${x.name ? "\"**" + capitalize(x.name) + "**\"": ""}${x.shiny ? " ⭐" : ""}　•　Level: ${x.level}　•　**IV**: ${(((x.s_hp + x.s_atk + x.s_def + x.s_spatk + x.s_spd + x.s_spdef) / 186) * 100).toFixed(2)}%`;
        }).join("\n")}`,
        footer: {
            text: `Showing ${foundPokemon[0].idx + 1} - ${foundPokemon[0].idx + 20} of Pokémon matching this search. [ Page ${page || 1} ]`
        },
        color: 44678
    }]
});
*/