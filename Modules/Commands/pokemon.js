import { SlashCommandBuilder } from "discord.js";
import capitalize from "../../Utilities/Misc/capitalize.js";
import pokemonFilter from "../../Utilities/Pokemon/pokemonFilter.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .addNumberOption(option => option.setName('page').setDescription('Page of Pokemon list'))
        .addNumberOption(option => option.setName('orderby').setDescription('1 - idx; 2 - iv; 3 - level').addChoices({ name: "IDX", value: 1 }, { name: "IV", value: 2 }, { name: "Level", value: 3 }))
        .addNumberOption(option => option.setName('ordertype').setDescription('ASC (default), Desc').addChoices({ name: "Ascending", value: 1 }, { name: "Descending", value: 0 }))
        .addStringOption(option => option.setName('query').setDescription('Enter the needed query. [Read Query cheatsheet for more help]'))
        .addStringOption(option => option.setName('export').setDescription("Export choices").addChoices({
            name: "ID Export",
            value: "id-export"
        }, {
            name: "CSV Export",
            value: "csv-export"
        }))
        .setName('pokemon')
        .setDescription('List your Pokemon'),
    async execute(msg) {

        // Page Number
        const page = (msg.options.getNumber("page") || 1) - 1;

        // Order By
        const orderBy = (msg.options.getNumber("orderby") || 1);

        // String Query 
        const query = msg.options.getString("query") || "";

        // Order Type
        const orderType = msg.options.getNumber("ordertype");

        // Export Type
        const exportOption = msg.options.getString('export');

        // Query all Pokemon from Postgres
        const allPokemon = await msg.client.postgres`SELECT * FROM pokemon WHERE user_id = ${msg.user.id}`;

        // Pokemon that passed Filter
        const passedFilteredPokemon = pokemonFilter(allPokemon, query, page, orderBy, orderType);

        if (!passedFilteredPokemon.length) return await msg.reply("Nothing passed that filter...");

        // Design value
        let numberLength = (passedFilteredPokemon.map(x => x.idx).sort((x, y) => y - x)[0]).toString().length;

        if (exportOption) {
            switch (exportOption) {
                case "id-export":
                    return await msg.reply({
                        embeds: [{
                            title: "ID Export",
                            description: `\`${passedFilteredPokemon.map(x => x.idx + 1).join(", ")}\``
                        }]
                    });

                case "csv-export":
                    return await msg.reply("Under development");
            }
        }

        await msg.reply({
            embeds: [{
                title: 'Your Pokemon',
                description: `${passedFilteredPokemon.map(x => {
                    return `\`${" ".repeat(numberLength - (x.idx + 1).toString().length)}${x.idx + 1}\`　　${capitalize(x.pokemon)} ${x.name ? "\"**" + capitalize(x.name) + "**\"" : ""}${x.shiny ? " ⭐" : ""}　•　Level: ${x.level}　•　**IV**: ${x.totalIV}%`;
                }).join("\n")}`,
                footer: {
                    text: `Showing ${(page + 1) * 20 - 20} - ${(page + 1) * 20 + 20} of Pokémon matching this search. [ Page ${page || 1} ]`
                },
                color: 44678
            }]
        });
    }
}