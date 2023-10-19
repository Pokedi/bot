import { AttachmentBuilder, SlashCommandBuilder } from "discord.js";
import userPokemonInfoModule from "../../Utilities/Pokemon/userPokemonInfoModule.js";
import builder from "../Database/QueryBuilder/queryGenerator.js";
import Player from "../../Classes/player.js";
import Pokedex from "../../Classes/pokedex.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .addStringOption(option => option.setName('query').setDescription('Type in the ID of the pokemon. (You may type in "latest" for the last one)'))
        .setName('info')
        .setDescription('View your Pokemon!'),
    async execute(msg) {
        const content = (msg.options.getString("query") || "latest").toLowerCase();

        // isID?
        const isID = !isNaN(parseInt(content)) && parseInt(content);

        const player = new Player({ id: BigInt(msg.user.id) });

        await player.fetch(msg.client.postgres);

        // Queries
        const { values, text } = builder.select('pokemon', "*").where(content.includes("l") ? {
            user_id: BigInt(msg.user.id)
        } : !isID && msg.user.player.selected[0] ? { id: msg.user.player.selected[0] } : {
            user_id: BigInt(msg.user.id),
            idx: parseInt(content)
        }).limit(1);

        const [selectedPokemon] = await msg.client.postgres.unsafe(text + (isID && parseInt(content) < 0 ? "OFFSET " + (-1 * parseInt(content)) : ""), values)

        let processedPokemon = new Pokedex(selectedPokemon);

        if (!processedPokemon.id)
            return msg.reply("pokemon does not exist.");

        // Count Total Pokemon
        const [{ count: countPokemon }] = await msg.client.postgres`SELECT COUNT(*) as count FROM pokemon WHERE user_id = ${player.id} LIMIT 1`;

        await processedPokemon.fetchByID();

        if (!processedPokemon.pokedex.id)
            return await msg.reply("This pokemon has not been registered in the database, please contact an admin for more help...");

        // await processedPokemon.getStatsV2(true);

        const file = new AttachmentBuilder(`../pokedi/pokemon/${processedPokemon.shiny ? "shiny" : "regular"}/${processedPokemon.pokedex._id}.png`);

        msg.reply({ embeds: [userPokemonInfoModule(processedPokemon, null, countPokemon)], files: [file] });
    }
}
