import { SlashCommandBuilder } from "discord.js";
import textTable from "text-table";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .addStringOption(option => option.setName('command').setDescription('code to execute').setRequired(true))
        .setName('sql')
        .setDescription('Admin command'),
    async execute(msg) {
        if (process.env.DEVIDS && JSON.parse(process.env.DEVIDS).includes(msg.user.id)) {
            try {
                const returnedData = await msg.client.postgres.unsafe(msg.options.getString("command"));
                try {
                    msg.reply("```JS\n" + textTable([].concat([returnedData.statement.columns.map(x => x.name)], returnedData.map(x => Object.values(x).map(x => x || ""))), { hsep: " | " }) + "\n```")
                } catch (error) {
                    msg.reply("```JSON\n" + JSON.stringify(returnedData, null, 4) + "\n```");
                }
            } catch (error) {
                console.log(error);
                msg.reply("Error");
            } finally {
            }
        }
    }
}
