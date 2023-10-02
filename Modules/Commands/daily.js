import Color from "color";
import { SlashCommandBuilder } from "discord.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('daily').setNameLocalizations({
            "de": "täglich",
            "es-ES": "diario",
            "pt-BR": "diario"
        })
        .setDescription('Check your daily balance.'),
    async execute(msg) {
        // Send Wait message
        const main = await msg.reply({ content: "🕰️ ... 🕰️", fetchReply: true });

        // Streak
        let [{ streak, total_votes, last_voted }] = await msg.client.postgres`SELECT * FROM user_vote WHERE type = 'top' AND id = ${msg.user.id}`;

        // Load Default
        if (!streak)
            [{ streak, total_votes, last_voted }] = { streak: 0, total_votes: 0, last_voted: new Date() };

        // Fetch Daily Config from DB
        const [row] = await msg.client.postgres`SELECT * FROM bot_configurations WHERE name = 'daily_config'`;

        // Parsing Daily Config
        const daily_config = JSON.parse(row.value);

        // Voting Streak
        let fields = [{
            name: "Voting Streak",
            value: "Current Streak: " + `${streak || 0}${last_voted && total_votes && streak == 0 ? " (Streak Lost)" : ""}\nTotal Streaks: ${total_votes}`
        }];

        // Ready Text Field
        let dailyFields = '';

        // Increment Daily Fields
        for (const daily of daily_config) {
            if (daily[0] <= streak)
                dailyFields += `**${daily[1]}**\n${daily[2].map(x => `- ${x.amount} ${x.type ? "redeem(s)" : "credits(s)"}`).join("\n")}\n`;
        }

        // Rewards
        fields.push({
            name: "Rewards",
            value: dailyFields
        });

        // Find Daily Time
        const dailytime = Math.floor((new Date(last_voted) + (24 + 1000 + 60 + 60)) / (24 + 1000 + 60 + 60));

        // If more time has passed
        fields.push({
            name: dailytime > 10 ? "Time" : "State",
            value: (dailytime > 10 ? `Please wait another ${dailytime}! ` : "") + `[Vote here!](https://pokedi.xyz/vote)`
        })

        // Content Edit
        await main.edit({
            content: "-",
            embeds: [{
                color: Color('#8bc34a').rgbNumber(),
                title: "Voting Rewards! (Vote every 12 hours for more chances to get redeems)",
                description: "Vote multiple times for better rewards!",
                fields
            }]
        });
    }
}
