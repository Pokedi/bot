import { SlashCommandBuilder } from "discord.js";
import { ENUM_COMMANDS, reverseENUM } from "../../Utilities/Data/enums.js";
import textTable from "text-table";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .addStringOption(option => option.setName('command').setDescription('code to execute'))
        .addStringOption(option => option.setName("command-check").setDescription("Check a command"))
        .addIntegerOption(option => option.setName("order").setDescription("Select how you wish to calculate the usages"))
        .setName('eval')
        .setDescription('Admin command'),
    mention_support: true,
    async execute(msg) {

        if (process.env.DEVIDS && JSON.parse(process.env.DEVIDS).includes(msg.user.id)) {

            // Check if command was ran via ping or interaction
            if (msg.isMessage) {
                const content = msg.content;
                if (content) {
                    try {
                        eval(content);
                    } catch (error) {
                        console.log(error);
                        msg.reply("Error");
                    }
                } else {
                    return msg.reply("No command provided to evaluate.");
                }
            } else
                if (msg.options.getString("command")) {
                    try {
                        eval(msg.options.getString("command"));
                    } catch (error) {
                        console.log(error);
                        msg.reply("Error");
                    } finally {
                    }
                } else {
                    const returnedData = (await msg.client.postgres`SELECT command,
COUNT(*) AS command_per_hour ,
DATE_TRUNC('hour', timestamp) AS hour
FROM logs 
WHERE timestamp >= CURRENT_DATE
GROUP BY hour, command ORDER BY hour desc, command desc;`);

                    return await msg.reply({ files: [{ attachment: Buffer.from("" + textTable([].concat([returnedData.statement.columns.map(x => x.name)], returnedData.map(x => { x.hour = new Date(x.hour).getHours(); if (x.command) x.command = ENUM_COMMANDS[x.command] || '0'; return x; }).map(x => Object.values(x).map(x => x || ""))), { hsep: " | " }) + "\n"), name: "stats.txt" }] });
                }
        }
    }
}
