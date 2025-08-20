import { SlashCommandBuilder, EmbedBuilder } from "discord.js"; // Import EmbedBuilder

import builder from "../Database/QueryBuilder/queryGenerator.js";

export default {
    help: "Configure various settings for your server and channels.",
    data: new SlashCommandBuilder()
        .setName("config")
        .setNameLocalizations({
            'pt-BR': 'configurar',
            'es-ES': 'configurar',
            'de': 'konfigurieren',
            'fr': 'configurer',
        })
        .setDescription("You can configure your Pokedi to meet your needs")
        .setDescriptionLocalizations({
            'pt-BR': 'Você pode configurar seu Pokedi para atender às suas necessidades',
            'es-ES': 'Puedes configurar tu Pokedi para satisfacer tus necessidades',
            'de': 'Sie können Ihren Pokedi an Ihre Bedürfnisse anpassen',
            'fr': 'Vous pouvez configurer votre Pokedi pour répondre à vos besoins',
        })
        .addSubcommandGroup(group => group
            .setName("server")
            .setDescription("Configure server-wide settings")
            .setDescriptionLocalizations({
                'pt-BR': 'Configurar as configurações do servidor',
                'es-ES': 'Configurar los ajustes del servidor',
                'de': 'Servereinstellungen konfigurieren',
                'fr': 'Configurer les paramètres du serveur',
                // 'ar': 'تكوين إعدادات الخادم'
            })
            .addSubcommand(subcommand => subcommand
                .setName("redirect_spawns")
                .setDescription("Redirect all spawns to specific channels.")
                .setDescriptionLocalizations({
                    'pt-BR': 'Redirecionar todos os spawns para canais especificados',
                    'es-ES': 'Redirigir todos los spawns a canales especificados',
                    'de': 'Leiten Sie alle Spawns an bestimmte Kanäle weiter',
                    'fr': 'Rediriger toutes les apparitions vers des canaux spécifiés',
                    // 'ar': 'إعادة توجيه جميع عمليات الظهور إلى قنوات محددة'
                })
                .addStringOption(option => option
                    .setName("channels")
                    .setDescription("The channels to redirect spawns to (use #channel mentions).")
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName("clear_redirects")
                .setDescription("Clear spawn redirection settings for the server.")
                .setNameLocalizations({
                    'pt-BR': 'limpar-redirecionamento',
                    'es-ES': 'limpiar-redireccionamiento',
                    'de': 'umleitung-löschen',
                    'fr': 'effacer-redirection',
                    // 'ar': 'مسح-إعادة-التوجيه'
                })
            )
        )
        .addSubcommandGroup(group => group
            .setName("channel")
            .setDescription("Configure channel-specific settings")
            .setDescriptionLocalizations({
                'pt-BR': 'Configurar as configurações do canal',
                'es-ES': 'Configurar los ajustes del canal',
                'de': 'Kanaleinstellungen konfigurieren',
                'fr': 'Configurer les paramètres du canal',
                // 'ar': 'تكوين إعدادات القناة'
            })
            .addSubcommand(subcommand => subcommand
                .setName("toggle_spawns")
                .setDescription("Enable or disable Pokémon spawns in this channel.")
                .addBooleanOption(option => option
                    .setName("enabled")
                    .setDescription("Set to true to enable spawns, false to disable.")
                    .setRequired(true)
                )
            )
        )
        .addSubcommandGroup(group => group
            .setName("check")
            .setDescription("Check current configurations")
            .addSubcommand(subcommand => subcommand
                .setName("settings")
                .setDescription("View all current server and channel configurations.")
                .setDescriptionLocalizations({
                    'pt-BR': 'Verificar todos os recursos disponíveis',
                    'es-ES': 'Verificar todas las funciones disponibles',
                    'de': 'Überprüfen Sie alle verfügbaren Funktionen',
                    'fr': 'Vérifier toutes les fonctionnalités disponibles',
                    // 'ar': 'تحقق من جميع الميزات المتاحة'
                })
            )
            // Added new subcommand for help within the check group
            .addSubcommand(subcommand => subcommand
                .setName("help")
                .setDescription("Displays help for the config command.")
            )
        ),
    mention_support: true,

    async execute(msg) {
        let group, subcommand;
        let options = {};

        if (msg.isMessage) {

            let args;
            [group, subcommand, ...args] = msg.content.trim().split(/\s+/);

            if (!group || !['check', 'a', 'channel', 'c', 'server', 's'].includes(group))
                return msg.reply({ content: "Invalid command usage. Try `@Pokedi config server redirect_spawns #channel, #channel2` or `@Pokedi config channel toggle_spawns [true/1|false/0]` or `@Pokedi config check settings` or `@Pokedi config check help`.", ephemeral: true });

            if (["redirect_spawns", 'r'].includes(subcommand)) options = { channelsInput: args.join(' ') };
            if (["toggle_spawns", 'ts'].includes(subcommand)) options = { toggle_spawns: args.join(' ').includes('1') || args.join(' ').includes('t') };

        } else {
            group = msg.options.getSubcommandGroup();
            subcommand = msg.options.getSubcommand();
            options = {
                channelsInput: msg.options.getString("channels"),
                toggle_spawns: msg.options.getBoolean("enabled")
            }
        }

        if (!msg.member.permissions.has("ManageGuild")) {
            return msg.reply({ content: "You need the 'Manage Server' permission to use this command.", ephemeral: true });
        }

        try {
            switch (group) {
                case "s":
                case "server":
                    await handleServerConfig(msg, subcommand, options);
                    break;
                case "c":
                case "channel":
                    await handleChannelConfig(msg, subcommand, options);
                    break;
                case "a":
                case "check":
                    await handleCheckConfig(msg, subcommand, options);
                    break;
                default:
                    await msg.reply({ content: "Invalid command usage.", ephemeral: true });
            }
        } catch (error) {
            console.error("Error in config command:", error);
            await msg.reply({ content: "An unexpected error occurred. Please try again later.", ephemeral: true });
        }
    }
};

async function handleServerConfig(msg, subcommand, values = {
    channelsInput: ''
}) {
    switch (subcommand) {
        case "r":
        case "rs":
        case "redirect_spawns": {
            const channelsInput = values.channelsInput;
            const channelIds = [...channelsInput.matchAll(/<#(\d+)>/g)].map(match => match[1]);

            if (channelIds.length === 0) {
                return msg.reply({ content: "Please provide valid channel mentions.", ephemeral: true });
            }

            const validChannels = [];
            for (const id of channelIds) {
                try {
                    const channel = await msg.guild.channels.fetch(id);
                    if (channel && channel.isTextBased()) {
                        validChannels.push(id);
                    }
                } catch {
                }
            }

            if (validChannels.length === 0) {
                return msg.reply({ content: "No valid text channels were found in your input.", ephemeral: true });
            }


            await upsertConfig(msg, "spawn_redirect", validChannels.join(','));
            msg.guild.configs.spawn_redirect = { config: validChannels.join(',') };

            return msg.reply(`Spawns will now be redirected to the specified channels.`);
        }
        case "cr":
        case "clear_redirects": {
            const deleted = await deleteConfig(msg, "spawn_redirect");
            if (deleted) {
                delete msg.guild.configs.spawn_redirect;
                return msg.reply("Spawn redirection has been cleared for this server.");
            }
            return msg.reply("No spawn redirection was configured for this server.");
        }
    }
}

async function handleChannelConfig(msg, subcommand, options = {
    'toggle_spawns': false
}) {
    switch (subcommand) {
        case "ts":
        case "toggle_spawns": {
            const enabled = options.toggle_spawns;

            if (enabled) {
                const deleted = await deleteConfig(msg, "spawn_disabled", true);
                if (deleted) {
                    delete msg.channel.configs.spawn_disabled;
                    return msg.reply("Spawns are now enabled in this channel.");
                }
                return msg.reply("Spawns were already enabled in this channel.");
            } else {
                await upsertConfig(msg, "spawn_disabled", "true", true);
                msg.channel.configs.spawn_disabled = { config: "true" };
                return msg.reply("Spawns are now disabled in this channel.");
            }
        }
    }
}

// Modified handleCheckConfig to include a 'help' subcommand
async function handleCheckConfig(msg, subcommand) {
    if (!subcommand || subcommand === "settings") {
        const guildConfigs = await msg.client.postgres`SELECT * FROM command_configuration WHERE guild_id = ${msg.guild.id} AND channel_id IS NULL`;
        const channelConfigs = await msg.client.postgres`SELECT * FROM command_configuration WHERE channel_id = ${msg.channel.id}`;

        const possibleGuildConfigs = { "spawn_redirect": "Spawn Redirect Channels" };
        const possibleChannelConfigs = { "spawn_disabled": "Spawns Disabled" };

        const guildFields = Object.entries(possibleGuildConfigs).map(([key, name]) => {
            const config = guildConfigs.find(c => c.command === key);
            const value = config ?
                // Spawn Redirect is practically the only Command that requires channels
                key == 'spawn_redirect' ? config.config.split(',').map(c => `<#${c}>`).join(' ') : config.config
                : "`Not Set`";
            return { name: `Server: ${name}`, value, inline: false };
        });

        const channelFields = Object.entries(possibleChannelConfigs).map(([key, name]) => {
            const config = channelConfigs.find(c => c.command === key);
            const value = config ? "`True`" : "`False`";
            return { name: `Channel: ${name}`, value, inline: false };
        });

        const embed = {
            title: "Configuration Status",
            description: `Showing settings for this server and the current channel (<#${msg.channel.id}>).`,
            fields: [...guildFields, ...channelFields].filter(Boolean),
            color: 0x5865F2,
        };

        return msg.reply({ embeds: [embed] });
    } else if (subcommand === "help") {
        const embed = new EmbedBuilder()
            .setTitle("Config Command Help")
            .setDescription("Use this command to configure various settings for your server and channels.")
            .setColor(0x5865F2)
            .addFields(
                {
                    name: "Server-Wide Settings (`server`)",
                    value: "Configure settings that apply to the entire server.",
                    inline: false
                },
                {
                    name: "Redirect Spawns",
                    value: "Slash: `/config server redirect_spawns channels:#channel1 #channel2`\n" +
                        "Mention: `@Pokedi config server redirect_spawns #channel1 #channel2`\n" +
                        "Mention: `@Pokedi config s rs #channel1 #channel2`\n" +
                        "Redirects all Pokémon spawns to the specified channels.",
                    inline: false
                },
                {
                    name: "Clear Redirects",
                    value: "Slash: `/config server clear_redirects`\n" +
                        "Mention: `@Pokedi config server clear_redirects`\n" +
                        "Mention: `@Pokedi config s cr`\n" +
                        "Clears any active spawn redirection for the server.",
                    inline: false
                },
                {
                    name: "Channel-Specific Settings (`channel`)",
                    value: "Configure settings for the current channel.",
                    inline: false
                },
                {
                    name: "Toggle Spawns",
                    value: "Slash: `/config channel toggle_spawns enabled:true`\n" +
                        "Mention: `@Pokedi config channel toggle_spawns true/false`\n" +
                        "Mention: `@Pokedi config c ts true/false`\n" +
                        "Enables or disables Pokémon spawns in the current channel.",
                    inline: false
                },
                {
                    name: "Check Configurations (`check`)",
                    value: "View current configuration settings.",
                    inline: false
                },
                {
                    name: "View Settings",
                    value: "Slash: `/config check settings`\n" +
                        "Mention: `@Pokedi config check settings`\n" +
                        "Mention: `@Pokedi config a`\n" +
                        "Displays all current server and channel configurations.",
                    inline: false
                },
                {
                    name: "Get Config Help",
                    value: "Slash: `/config check help`\n" +
                        "Mention: `@Pokedi config check help`\n" +
                        "Displays this help message for the config command.",
                    inline: false
                }
            );
        return msg.reply({ embeds: [embed] });
    } else {
        return msg.reply({ content: "Invalid subcommand for `check`. Use `settings` or `help`.", ephemeral: true });
    }
}


async function upsertConfig(msg, command, configValue, isChannel = false) {
    const postgres = msg.client.postgres;

    const whereClause = {
        guild_id: BigInt(msg.guild.id),
        command: command
    };

    if (isChannel)
        whereClause.channel_id = BigInt(msg.channel.id);

    const selectQuery = builder.select('command_configuration', 'id').where(whereClause);
    const { text: selectText, values: selectValues } = selectQuery;
    const existing = await postgres.unsafe(selectText, selectValues);

    let query;
    if (existing.length > 0) {
        query = builder.update('command_configuration', { config: configValue }).where(whereClause);
    } else {
        const insertData = { ...whereClause, config: configValue };
        query = builder.insert('command_configuration', insertData);
    }

    const { text, values } = query;
    await postgres.unsafe(text, values);
}

async function deleteConfig(msg, command, isChannel = false) {
    const whereClause = {
        guild_id: BigInt(msg.guild.id),
        command: command
    };

    if (whereClause)
        whereClause.channel_id = BigInt(msg.channel.id);

    const { values, text } = builder.deletes('command_configuration').where(whereClause);
    const result = await msg.client.postgres.unsafe(text, values);

    return result.count > 0;
}
