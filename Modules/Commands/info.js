import { AttachmentBuilder, SlashCommandBuilder } from "discord.js";
import userPokemonInfoModule from "../../Utilities/Pokemon/userPokemonInfoModule.js";
import builder from "../Database/QueryBuilder/queryGenerator.js";
import Player from "../../Classes/player.js";
import Pokedex from "../../Classes/pokedex.js";
import getDominantColor from "../../Utilities/Misc/getDominantColor.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .addStringOption(option => option.setName('query').setDescription('Type in the ID of the pokemon. (You may type in "latest" for the last one)'))
        .addBooleanOption(option => option.setName("help").setDescription("View details on how to use this command"))
        .setName('info')
        .setDescription('View your Pokemon!'),
    async execute(msg) {

        // Redirect to Help
        if (msg.options.getBoolean("help"))
            return msg.options._hoistedOptions.push({ name: "command_name", type: 3, value: "info" }),
                msg.client.commands.get("help")(msg);

        const content = (msg.options.getString("query") || "").toLowerCase();

        // isID?
        const isID = !isNaN(parseInt(content)) && parseInt(content);

        const player = new Player({ id: BigInt(msg.user.id) });

        await player.fetchColumns(msg.client.postgres, "id, selected");

        // Count Total Pokemon
        const [{ count: countPokemon }] = await msg.client.postgres`SELECT MAX(idx) as count FROM pokemon WHERE user_id = ${player.id} LIMIT 1`;

        // Queries
        const { values, text } = builder.select('pokemon', "*").where(content.includes("l") ? {
            idx: countPokemon,
            user_id: player.id,
            guild_id: msg.guild.info.mode ? msg.guild.id : null
        } : (!isID && player.selected && player.selected.length ? { id: player.selected[0], guild_id: msg.guild.info.mode ? msg.guild.id : null } : {
            user_id: player.id,
            idx: parseInt(content || "1"),
            guild_id: msg.guild.info.mode ? msg.guild.id : null
        })).limit(1);

        const [selectedPokemon] = await msg.client.postgres.unsafe(text + (isID && parseInt(content) < 0 ? "OFFSET " + (-1 * parseInt(content)) : ""), values)

        let processedPokemon = new Pokedex(selectedPokemon);

        if (!processedPokemon.id)
            return msg.reply("pokemon does not exist.");

        await processedPokemon.fetchByID();

        if (!processedPokemon.pokedex.id)
            return await msg.reply("This pokemon has not been registered in the database, please contact an admin for more help...");

        const file = new AttachmentBuilder(`../pokediAssets/pokemon/${processedPokemon.shiny ? "shiny" : "regular"}/${processedPokemon.pokemon}.png`);

        const color = await getDominantColor(file.attachment, true);

        msg.reply({ embeds: [userPokemonInfoModule(processedPokemon, null, countPokemon, color)], files: [file] });
    }
}
