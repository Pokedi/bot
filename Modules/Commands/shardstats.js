import { SlashCommandBuilder } from "discord.js";
import pidusage from "pidusage";
import arraySum from "../../Utilities/Misc/arraySum.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName("shardstats")
        .setDescription("Get all shard specific stats"),
    async execute(msg) {
        (msg.client.cluster.broadcastEval(client => ({
            ids: client.cluster.ids.size,
            info: client.cluster.info,
            clusterid: client.cluster.id,
            usage: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
            pid: process.pid,
            guilds: client.guilds.cache.size,
            ping: client.ws.ping
        }))).then(x => {
            pidusage(x.map(y => y.pid), { usePs: true }, function (err, stats) {
                return msg.reply({
                    embeds: [{
                        "title": "Pokedi Stats",
                        "fields": x.sort((y, z) => y.info.id - z.info.id).map((y, i) => {
                            return {
                                name: `Cluster #${y.clusterid}`,
                                value: `ShardIDs: \`${y.info.SHARD_LIST.join(", ")}\`\nCPU: \`${stats[y.pid]['cpu'].toFixed(2)}%\`\nRAM: \`${y.usage}MB\`\nGuilds: \`${y.guilds}\`\nPing: \`${y.ping}ms\``,
                                inline: true
                            };
                        }
                        ),
                        "footer": {
                            text: `Current Cluster: ${msg.client.cluster.id}\nCurrent Pokedi Shard: ${msg.client.shardID}`
                        }, timestamp: new Date(),
                        "description": (() => {
                            return `**Total Memory:** \`${(arraySum(x.map(x => parseFloat(x.usage))) || 0).toFixed(2)}MB\`\n**Total Clusters**: ${msg.client.cluster.count}\n**Total Shards in this Cluster**: ${msg.client.cluster.ids.size}\n**Total CPU**: \`${arraySum(x.map(x => parseFloat(stats[x.pid].cpu.toFixed(2))))}%\`\n**Total Servers**: \`${arraySum(x.map(y => y.guilds))}\`\n**Average Ping**:\`${(arraySum(x.map(y => y.ping)) / arraySum(x.map(y => y.ids))).toFixed(2)}ms\``
                        }
                        )()
                    }]
                })
            });
        })
    }
}
