import { SlashCommandBuilder } from "discord.js";
import capitalize from "../../Utilities/Misc/capitalize.js";
import pokemonFilter from "../../Utilities/Pokemon/pokemonFilter.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .addNumberOption(option => option.setName('page').setDescription('Page of Pokemon list'))
        .addNumberOption(option => option.setName('orderby').setDescription('1 - idx; 2 - iv; 3 - level').addChoices({ name: "IDX", value: 1 }, { name: "IV", value: 2 }, { name: "Level", value: 3 }, { name: "Alphabetical", value: 4 }))
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
        let orderBy = (msg.options.getNumber("orderby"));

        // String Query 
        const query = msg.options.getString("query") || "";

        // Order Type
        let orderType = msg.options.getNumber("ordertype");

        // Export Type
        const exportOption = msg.options.getString('export');

        // Query all Pokemon from Postgres
        const allPokemon = await msg.client.postgres`SELECT * FROM pokemon WHERE user_id = ${msg.user.id}`;

        // Return if No Pokemon
        if (!allPokemon.length) return await msg.reply("You got no Pokemon, my dude...");

        // User Defaults
        let userDefault = (await msg.client.prisma.users.findFirst({
            where: {
                id: BigInt(msg.user.id)
            },
            select: {
                order_by: true
            }
        }))?.order_by;

        if (!orderBy && userDefault) {
            if (userDefault.startsWith("idx")) orderBy = 1;
            if (userDefault.startsWith("iv")) orderBy = 2;
            if (userDefault.startsWith("l")) orderBy = 3;
            if (userDefault.startsWith("a")) orderBy = 4;
        }

        if (orderType == undefined && userDefault) {
            if (userDefault.endsWith("asc")) orderType = 1;
            if (userDefault.endsWith("desc")) orderType = 0;
        }

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
                            description: `\`${passedFilteredPokemon.map(x => x.idx).join(", ")}\``
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
                    return `\`${" ".repeat(numberLength - (x.idx).toString().length)}${x.idx}\`　　${capitalize(x.pokemon)} ${x.name ? "\"**" + capitalize(x.name) + "**\"" : ""}${x.shiny ? " ⭐" : ""}　•　Level: ${x.level}　•　**IV**: ${x.totalIV}%`;
                }).join("\n")}`,
                footer: {
                    text: `Showing ${(page + 1) * 20 - 19} - ${(page + 1) * 20} of ${allPokemon.length} Pokémon matching this search. [ Page ${page || 1} ]`
                },
                color: 44678
            }]
        });
    }
}