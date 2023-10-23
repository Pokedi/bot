import { SlashCommandBuilder } from "discord.js";
import capitalize from "../../Utilities/Misc/capitalize.js";
import pokemonFilter from "../../Utilities/Pokemon/pokemonFilter.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .addNumberOption(option => option.setName('page').setDescription('Page of Pokemon list'))
        .addStringOption(option => option.setName('orderby').setDescription('1 - idx; 2 - iv; 3 - level; 4 - alphabetic').addChoices({ name: "IDX", value: "idx" }, { name: "IV", value: "iv" }, { name: "Level", value: "level" }, { name: "Alphabetical", value: "pokemon" }))
        .addStringOption(option => option.setName('ordertype').setDescription('ASC (default), Desc').addChoices({ name: "Ascending", value: "asc" }, { name: "Descending", value: "desc" }))
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
        let orderBy = (msg.options.getString("orderby"));

        // String Query 
        const query = msg.options.getString("query") || "";

        // Order Type
        let orderType = msg.options.getString("ordertype");

        // Export Type
        const exportOption = msg.options.getString('export');

        // Query all Pokemon from Postgres
        // const allPokemon = await msg.client.postgres`SELECT id, idx, pokemon, s_atk, s_hp, s_def, s_spatk, s_spdef, s_spd, nature, level, shiny, name FROM pokemon WHERE user_id = ${msg.user.id}`;

        // Return if No Pokemon
        // if (!allPokemon.length) return await msg.reply("You got no Pokemon, my dude...");

        // User Defaults
        let userDefault = (await msg.client.postgres`SELECT order_by FROM users WHERE id = ${msg.user.id}`)?.[0]?.order_by;

        if (orderBy == "iv")
            orderBy = "((CAST(s_atk + s_spatk + s_def + s_spdef + s_spd + s_hp AS FLOAT)/186) * 100)";

        if (!orderBy && userDefault) {
            if (userDefault.startsWith("idx")) orderBy = "idx";
            if (userDefault.startsWith("iv")) orderBy = "((CAST(s_atk + s_spatk + s_def + s_spdef + s_spd + s_hp AS FLOAT)/186) * 100)";
            if (userDefault.startsWith("l")) orderBy = "level";
            if (userDefault.startsWith("a")) orderBy = "pokemon";
        }

        if (orderType == undefined && userDefault) {
            if (userDefault.endsWith("asc")) orderType = "asc";
            if (userDefault.endsWith("desc")) orderType = "desc";
        }

        // Pokemon that passed Filter
        const passedFilteredPokemon = await pokemonFilter(msg.user.id, query, page, orderBy, orderType);

        const totalPokemon = await pokemonFilter(msg.user.id, query, -1);

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
                    return `\`${" ".repeat(numberLength - (x.idx || 0).toString().length)}${x.idx || 0}\`　　${capitalize(x.pokemon, true)} ${x.name ? "\"**" + capitalize(x.name) + "**\"" : ""}${x.shiny ? " ⭐" : ""}　•　Level: ${x.level}　•　**IV**: ${x.totalIV}%`;
                }).join("\n")}`,
                footer: {
                    text: `Showing ${passedFilteredPokemon[0].idx} - ${passedFilteredPokemon[passedFilteredPokemon.length - 1].idx} of ${totalPokemon} Pokémon matching this search. [ Page ${page || 1} of ${Math.round(totalPokemon / 20)} ]`
                },
                color: 44678
            }]
        });
    }
}