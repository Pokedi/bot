import { SlashCommandBuilder } from "discord.js";
import pidusage from "pidusage";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName("shardstats")
        .setDescription("Get all shard specific stats"),
    async execute(msg) {
        (msg.client.cluster.broadcastEval("[this.shardID, (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2), process.pid, this.guilds.cache.size, this.ws.ping]")).then(x => {
            pidusage(x.map(y => y[2]), { usePs: true }, function (err, stats) {
                return msg.reply({
                    embeds: [{
                        "title": "Pokedi Stats",
                        "fields": x.sort((y, z) => y[0] - z[0]).map((y, i) => {
                            return {
                                name: `Shard ${y[0]}`,
                                value: `CPU: \`${stats[y[2]]['cpu'].toFixed(2)}%\`\nRAM: \`${y[1]}MB\`\nGuilds: \`${y[3]}\`\nPing: \`${y[4]}ms\``,
                                inline: true
                            };
                        }
                        ),
                        "footer": {
                            text: `Current Cluster: ${msg.client.cluster.id}\nRunning Pokedi Shard: ${msg.client.shardID}`
                        }, timestamp: new Date(),
                        "description": (() => {
                            let total = x.map(y => [y[0], y[1], y[3], parseFloat(stats[y[2]].cpu.toFixed(2)), y[4]]).reduce((y, z) => {
                                return [y[0] + 1, parseInt(y[1]) + parseInt(z[1]), y[2] + z[2], y[3] + z[3], y[4] + z[4]];
                            }
                            );
                            return `**Total Memory:** \`${total[1]}MB\`\n**Total Clusters**: ${msg.client.cluster.count}\n**Total Shards in Cluster**: ${msg.client.cluster.ids.size}\n**Total CPU**: \`${total[3].toFixed(2)}%\`\n**Total Servers**: \`${total[2]}\`\n**Average Ping**:\`${(total[4] / (total[0] + 1)).toFixed(2)}ms\``
                        }
                        )()
                    }]
                })
            });
        })
    }
}
