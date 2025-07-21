import { SlashCommandBuilder } from "discord.js";
import textTable from "text-table";
import pokemondb from "../Database/pokedb.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .addStringOption(option => option.setName('command').setDescription('code to execute').setRequired(true))
        .addBooleanOption(option => option.setName('pokedb').setDescription('Switch to PokemonDB'))
        .setName('sql')
        .setDescription('Admin command'),
    async execute(msg) {
        if (process.env.DEVIDS && JSON.parse(process.env.DEVIDS).includes(msg.user.id)) {
            try {
                const returnedData = msg.options.getBoolean("pokedb") ? await pokemondb.unsafe(msg.options.getString("command")) : await msg.client.postgres.unsafe(msg.options.getString("command"));
                try {
                    await msg.reply("```JS\n" + textTable([].concat([returnedData.statement.columns.map(x => x.name)], returnedData.map(x => Object.values(x).map(x => x || ""))), { hsep: " | " }) + "\n```")
                } catch (error) {
                    try {
                        await msg.reply("```JSON\n" + JSON.stringify(returnedData, null, 4) + "\n```");
                    } catch (error) {
                        await msg.reply({ files: [{ attachment: Buffer.from("" + textTable([].concat([returnedData.statement.columns.map(x => x.name)], returnedData.map(x => Object.values(x).map(x => x || ""))), { hsep: " | " }) + "\n"), name: "hello.txt" }] })
                    }
                }
            } catch (error) {
                console.log(error);
                msg.reply("Error");
            } finally {
            }
        }
    }
}
