import { SlashCommandBuilder } from "discord.js";
import pidusage from "pidusage";
import arraySum from "../../Utilities/Misc/arraySum.js";
import { execSync } from "child_process";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName("shardstats")
        .setNameLocalizations({
            'pt-BR': 'estatisticasdosfragmentos',
            'es-ES': 'estadisticasdelosfragmentos',
            'de': 'shardstatistiken',
            'fr': 'statistiquesdesfragments',
            // 'ar': 'إحصائيات-الشارد'
        })
        .setDescription("Get all shard specific stats")
        .setDescriptionLocalizations({
            'pt-BR': 'Obtenha todas as estatísticas específicas do fragmento',
            'es-ES': 'Obtenga todas las estadísticas específicas del fragmento',
            'de': 'Holen Sie sich alle Shard-spezifischen Statistiken',
            'fr': 'Obtenez toutes les statistiques spécifiques aux fragments',
            // 'ar': 'الحصول على جميع الإحصائيات الخاصة بالشارد'
        }),
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

                // Get Commit hash
                const commitHash = execSync('git rev-parse --short HEAD', {
                    encoding: 'utf-8'
                }).trim();

                // Find the latest branch
                execSync('git fetch', { encoding: 'utf-8' });

                const latestHash = execSync('git rev-parse --short origin/' + (process.env.DEV ? 'develop' : 'main'), { encoding: 'utf-8'}).trim();

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
                            return `**Total Memory:** \`${(arraySum(x.map(x => parseFloat(x.usage))) || 0).toFixed(2)}MB\`\n**Total Clusters**: ${msg.client.cluster.count}\n**Total Shards in this Cluster**: ${msg.client.cluster.ids.size}\n**Total CPU**: \`${arraySum(x.map(x => parseFloat(stats[x.pid].cpu.toFixed(2))))}%\`\n**Total Servers**: \`${arraySum(x.map(y => y.guilds))}\`\n**Average Ping**:\`${(arraySum(x.map(y => y.ping)) / arraySum(x.map(y => y.ids))).toFixed(2)}ms\`\n**Current Commit Hash**: \`${commitHash}\`\n**Latest Version**: \`${latestHash}\` ${latestHash != commitHash ? '**(UPDATE REQUIRED)**' : '(_Up-to-Date_)'}`
                        }
                        )()
                    }]
                })
            });
        })
    }
}
