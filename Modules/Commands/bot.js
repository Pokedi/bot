import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import pidusage from "pidusage";
import arraySum from "../../Utilities/Misc/arraySum.js";
import { execSync } from "child_process";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName("bot")
        .setNameLocalizations({
            'pt-BR': 'bot',
            'es-ES': 'bot',
            'de': 'bot',
            'fr': 'bot',
            // 'ar': 'بوت'
        })
        .setDescription("Get stats of the bot")
        .setDescriptionLocalizations({
            'pt-BR': 'Obtenha estatísticas do bot',
            'es-ES': 'Obtenga estadísticas del bot',
            'de': 'Holen Sie sich Bot-Statistiken',
            'fr': 'Obtenez des statistiques du bot',
            // 'ar': 'الحصول على إحصائيات البوت'
        })
        .addSubcommand(subcommand => subcommand
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
            }))
        .addSubcommand(x => x
            .setName('change_log')
            .setDescription('View Change Logs')
        ),
    async execute(msg) {
        if (msg.options.getSubcommand() == "shardstats") {

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

                    const latestHash = execSync('git rev-parse --short origin/' + (process.env.DEV ? 'develop' : 'main'), { encoding: 'utf-8' }).trim();

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
        } else if (msg.options.getSubcommand() == "change_log") {

            const rows = await msg.client.postgres`
            SELECT * FROM change_logs
            WHERE guild_id = ${msg.guild.id}
            ORDER BY log_date DESC
        `;

            if (rows.length > 0) {

                const embed = new EmbedBuilder()
                    .setTitle('Change Logs')
                    .setDescription('Here are the latest change logs:');

                const logs = rows.map(log => `**${log.log_type}**: ${log.log_message} by ${log.log_author} on ${log.log_date}`);

                embed.addFields({ name: '\u200b', value: logs.join('\n') });

                const button = new ButtonBuilder()
                    .setLabel('View More')
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('view_more');

                const actionRow = new ActionRowBuilder()
                    .addComponents(button);

                msg.reply({ embeds: [embed], components: [actionRow] });

                const collector = msg.channel.createMessageComponentCollector({ time: 60000 });

                collector.on('collect', async i => {

                    if (i.customId === 'view_more') {

                        const modal = new ModalBuilder()
                            .setCustomId('view_more_modal')
                            .setTitle('View More Change Logs');

                        const logInput = new TextInputBuilder()
                            .setCustomId('log_input')
                            .setLabel('Enter the number of logs to view:')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('10');

                        modal.addComponents(new ActionRowBuilder().addComponents(logInput));

                        await i.showModal(modal);

                        const modalCollector = i.channel.awaitModalSubmit({ time: 60000 });

                        modalCollector.on('collect', async modal => {

                            const logCount = parseInt(modal.fields.getTextInputValue('log_input'));

                            if (!isNaN(logCount)) {

                                const rows = await msg.client.postgres`SELECT * FROM change_logs
                                WHERE guild_id = ${msg.guild.id}
                                ORDER BY log_date DESC
                                LIMIT ${logCount}`;

                                if (rows.length > 0) {

                                    const embed = new EmbedBuilder()
                                        .setTitle('Change Logs')
                                        .setDescription('Here are the latest change logs:');

                                    const logs = rows.map(log => `**${log.log_type}**: ${log.log_message} by ${log.log_author} on ${log.log_date}`);

                                    embed.addFields({ name: '\u200b', value: logs.join('\n') });

                                    await modal.reply({ embeds: [embed] });

                                } else {

                                    await modal.reply('No change logs found.');
                                }

                            } else {

                                await modal.reply('Invalid input. Please enter a number.');
                            }
                        });

                        modalCollector.on('end', () => {

                            if (modalCollector.collected.size === 0) {

                                msg.channel.send('Modal timed out.');
                            }
                        });
                    }
                });

                collector.on('end', () => {

                    if (collector.collected.size === 0) {

                        msg.channel.send('Button timed out.');
                    }
                });
                
            } else {

                msg.reply('No change logs found.');
            }

        }
    }
}

