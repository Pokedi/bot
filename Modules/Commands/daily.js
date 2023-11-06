import Color from "color";
import { SlashCommandBuilder } from "discord.js";
import crates from "../../Utilities/Data/crates.json" assert {type: "json"};

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
        // const main = await msg.reply({ content: "🕰️ ... 🕰️", fetchReply: true });

        // Assigning Variables
        let streak, total_votes, last_voted;

        // Streak
        let [row] = await msg.client.postgres`SELECT streak, total_votes, last_voted FROM user_vote WHERE type = 'top' AND id = ${msg.user.id}`;

        // Load Default
        if (!row.total_votes)
            [{ streak, total_votes, last_voted }] = { streak: 0, total_votes: 0, last_voted: new Date() };
        else {
            streak = row.streak || 0;
            total_votes = row.total_votes;
            last_voted = row.last_voted;
        }

        // Voting Streak
        let fields = [{
            name: "Voting Streak",
            value: "Current Streak: " + `${streak || 0}${last_voted && total_votes && streak == 0 ? " (Streak Lost)" : ""}\nTotal Streaks: ${total_votes}`
        }];

        // Ready Text Field
        let dailyFields = '';

        // Increment Daily Fields
        for (const crate of crates) {
            if ((crate.streak || 0) <= streak)
                dailyFields += `**${crate.name}**${crate.chance ? " (" + crate.chance + "%)" : ""}\n${crate.items.flat().map(x => `- ${x.name} (${x.min ? `${x.min} - ${x.max}` : x.amount})`).join("\n")}\n`;
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
        await msg.reply({
            embeds: [{
                color: Color('#8bc34a').rgbNumber(),
                title: "Voting Rewards! (Vote every 12 hours for more chances to get redeems)",
                description: "Vote multiple times for better rewards!",
                fields
            }]
        });
    }
}
