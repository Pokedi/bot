import { SlashCommandBuilder, EmbedBuilder, ChannelType } from "discord.js";
import builder from "../Database/QueryBuilder/queryGenerator.js";
import Player from "../../Classes/player.js";
// Assuming 'i18n' is a module that provides internationalization functions.
// This is a placeholder and should be replaced with the actual i18n module.
import i18n from 'i18n';

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
            })
            .addSubcommand(subcommand => subcommand
                .setName("redirect_spawns")
                .setDescription("Redirect all spawns to specific channels.")
                .setDescriptionLocalizations({
                    'pt-BR': 'Redirecionar todos os spawns para canais especificados',
                    'es-ES': 'Redirigir todos los spawns a canales especificados',
                    'de': 'Leiten Sie alle Spawns an bestimmte Kanäle weiter',
                    'fr': 'Rediriger toutes les apparitions vers des canaux spécifiés',
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
                })
            )
            .addSubcommand(subcommand => subcommand
                .setName('language')
                .setDescription('Set the language of the server')
                .setDescriptionLocalizations({
                    'pt-BR': 'Definir o idioma do servidor',
                    'es-ES': 'Establecer el idioma del servidor',
                    'de': 'Stellen Sie die Sprache des Servers ein',
                    'fr': 'Définir la langue du serveur',
                })
                .addStringOption(option => option
                    .setName('locale')
                    .setDescription('Simple Locale')
                    .setChoices({
                        name: 'English',
                        value: 'en'
                    }, {
                        name: 'Spanish',
                        value: 'es-ES'
                    }, {
                        name: 'Portuguese',
                        value: 'pt-BR'
                    }, {
                        name: 'German',
                        value: 'de'
                    }, {
                        name: 'French',
                        value: 'fr'
                    })
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName('bot_updates')
                .setDescription('Enable or disable Bot Updates.')
                .setDescriptionLocalizations({
                    'pt-BR': 'Ativar ou desativar atualizações do Bot',
                    'es-ES': 'Activar o desactivar actualizaciones del Bot',
                    'de': 'Aktivieren oder deaktivieren Sie Bot-Updates',
                    'fr': 'Activer ou désactiver les mises à jour du Bot',
                })
                .addChannelOption(option => option
                    .setName('update_channel')
                    .setDescription('The channel to send updates to.')
                    .setDescriptionLocalizations({
                        'pt-BR': 'O canal para enviar atualizações para',
                        'es-ES': 'El canal para enviar actualizaciones a',
                        'de': 'Der Kanal, an den Updates gesendet werden sollen',
                        'fr': 'Le canal pour envoyer les mises à jour',
                    })
                    .addChannelTypes(ChannelType.GuildText)
                )
                .addBooleanOption(option => option
                    .setName('toggle_updates')
                    .setDescription('Set to true to enable updates, false to disable.')
                    .setDescriptionLocalizations({
                        'pt-BR': 'Defina para verdade para ativar atualizações, para falso para desativar',
                        'es-ES': 'Establecer a verdadero para activar actualizaciones, a falso para desactivar',
                        'de': 'Setzen Sie auf wahr, um Updates zu aktivieren, auf falsch, um sie zu deaktivieren',
                        'fr': 'Définir sur vrai pour activer les mises à jour, sur faux pour les desactiver',
                    })
                )
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
            })
            .addSubcommand(subcommand => subcommand
                .setName("toggle_spawns")
                .setDescription("Enable or disable Pokémon spawns in this channel.")
                .setDescriptionLocalizations({
                    'pt-BR': 'Ativar ou desativar os spawns de Pokémon neste canal',
                    'es-ES': 'Activar o desactivar los spawns de Pokémon en este canal',
                    'de': 'Aktivieren oder deaktivieren Sie Pokémon-Spawns in diesem Kanal',
                    'fr': 'Activer ou désactiver les apparitions de Pokémon dans ce canal',
                })
                .addBooleanOption(option => option
                    .setName("enabled")
                    .setDescription("Set to true to enable spawns, false to disable.")
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName('language')
                .setDescription('Set the language of the server')
                .setDescriptionLocalizations({
                    'pt-BR': 'Definir o idioma do canal',
                    'es-ES': 'Establecer el idioma del canal',
                    'de': 'Stellen Sie die Sprache des Kanals ein',
                    'fr': 'Définir la langue du canal',
                })
                .addStringOption(option => option
                    .setName('locale')
                    .setDescription('Simple Locale')
                    .setChoices({
                        name: 'English',
                        value: 'en'
                    }, {
                        name: 'Spanish',
                        value: 'es-ES'
                    }, {
                        name: 'Portuguese',
                        value: 'pt-BR'
                    }, {
                        name: 'German',
                        value: 'de'
                    }, {
                        name: 'French',
                        value: 'fr'
                    })
                )
            )
        )
        .addSubcommandGroup(group => group
            .setName('user')
            .setDescription('Set configs for yourself')
            .setDescriptionLocalizations({
                'pt-BR': 'Definir configurações para você',
                'es-ES': 'Configurar ajustes para usted',
                'de': 'Konfigurieren Sie Einstellungen für sich selbst',
                'fr': 'Définir les configurations pour vous-même',
            })
            .addSubcommand(subcommand => subcommand
                .setName('language')
                .setDescription('Set the language of the server')
                .setDescriptionLocalizations({
                    'pt-BR': 'Definir o seu idioma',
                    'es-ES': 'Establecer su idioma',
                    'de': 'Stellen Sie Ihre Sprache ein',
                    'fr': 'Définir votre langue',
                })
                .addStringOption(option => option
                    .setName('locale')
                    .setDescription('Simple Locale')
                    .setChoices({
                        name: 'English',
                        value: 'en'
                    }, {
                        name: 'Spanish',
                        value: 'es-ES'
                    }, {
                        name: 'Portuguese',
                        value: 'pt-BR'
                    }, {
                        name: 'German',
                        value: 'de'
                    }, {
                        name: 'French',
                        value: 'fr'
                    })
                )
            )
        )
        .addSubcommandGroup(group => group
            .setName("check")
            .setDescription("Check current configurations")
            .setDescriptionLocalizations({
                'pt-BR': 'Verificar as configurações atuais',
                'es-ES': 'Comprobar las configuraciones actuales',
                'de': 'Überprüfen Sie die aktuellen Konfigurationen',
                'fr': 'Vérifier les configurations actuelles',
            })
            .addSubcommand(subcommand => subcommand
                .setName("settings")
                .setDescription("View all current server and channel configurations.")
                .setDescriptionLocalizations({
                    'pt-BR': 'Verificar todas as configurações atuais do servidor e do canal',
                    'es-ES': 'Ver todos los ajustes de configuración actuales del servidor y del canal',
                    'de': 'Alle aktuellen Server- und Kanalkonfigurationen anzeigen',
                    'fr': 'Afficher toutes les configurations actuelles du serveur et du canal',
                })
            )
            .addSubcommand(subcommand => subcommand
                .setName("help")
                .setDescription("Displays help for the config command.")
                .setDescriptionLocalizations({
                    'pt-BR': 'Exibe a ajuda para o comando de configuração',
                    'es-ES': 'Muestra la ayuda para el comando de configuración',
                    'de': 'Zeigt die Hilfe für den Konfigurationsbefehl an',
                    'fr': 'Affiche l\'aide pour la commande de configuration',
                })
            )
        ),
    mention_support: true,
    /**
    * @param {import('discord.js').Interaction} msg
    */
    async execute(msg) {
        let group, subcommand;
        let options = {};

        if (msg.isMessage) {
            let args;
            [group, subcommand, ...args] = msg.content.trim().split(/\s+/);

            if (!group || !['check', 'a', 'channel', 'c', 'server', 's', 'user', 'u'].includes(group))
                return msg.reply({ content: i18n.__('commands.config.invalid_use'), ephemeral: true });

            if (['locale', 'l'].includes(subcommand)) {
                if (!['pt-BR', 'es-ES', 'en', 'fr', 'de'].includes(args.join("")))
                    return msg.reply(i18n.__('commands.config.only_langs'));
                options = { language: args.join(' ') };
            }

            if (["redirect_spawns", 'r'].includes(subcommand)) options = { channelsInput: args.join(' ') };
            if (["bot_updates", 'bu'].includes(subcommand)) {
                // If not channel was mentioned, we'll assume it's true or false
                if (!msg.guild.channels.cache.get(args.join(' ').match(/<#(\d+)>/)?.[1])) {
                    options = { toggle_updates: args.join(' ').includes('1') || args.join(' ').includes('t') };
                } else {
                    // Let's check the channel's validity here
                    // First get the ID
                    const channelID = args.join(' ').match(/<#(\d+)>/)?.[1];
                    if (channelID && msg.guild.channels.cache.get(channelID).permissionsFor(msg.client.user).has('SendMessages'))
                        options = { update_channel: msg.guild.channels.cache.get(channelID) };
                    else
                        return msg.reply({ content: i18n.__('commands.config.invalid_channel'), ephemeral: true });
                }
            }
            if (["toggle_spawns", 'ts'].includes(subcommand)) options = { toggle_spawns: args.join(' ').includes('1') || args.join(' ').includes('t') };

        } else {
            group = msg.options.getSubcommandGroup();
            subcommand = msg.options.getSubcommand();
            options = {
                channelsInput: msg.options.getString("channels"),
                toggle_spawns: msg.options.getBoolean("enabled"),
                language: msg.options.getString('locale'),
                update_channel: msg.options.getChannel('update_channel'),
                toggle_updates: msg.options.getBoolean('toggle_updates')
            }
        }


        try {
            switch (group) {
                case "s":
                case "server":
                    if (!msg.member.permissions.has("ManageGuild"))
                        return msg.reply({ content: i18n.__('commands.config.manager'), ephemeral: true });
                    await handleServerConfig(msg, subcommand, options);
                    break;
                case "c":
                case "channel":
                    if (!msg.member.permissions.has("ManageGuild"))
                        return msg.reply({ content: i18n.__('commands.config.manager'), ephemeral: true });
                    await handleChannelConfig(msg, subcommand, options);
                    break;
                case "u":
                case "user":
                    await handleUserConfig(msg, subcommand, options);
                    break;
                case "a":
                case "check":
                    await handleCheckConfig(msg, subcommand, options);
                    break;
                default:
                    await msg.reply({ content: i18n.__('commands.config.invalid_command'), ephemeral: true });
            }
        } catch (error) {
            console.error("Error in config command:", error);
            await msg.reply({ content: i18n.__('commands.config.unexpected'), ephemeral: true });
        }
    }
};

async function handleServerConfig(msg, subcommand, values = {
    channelsInput: '',
    language: 'en',
    update_channel: null,
    toggle_updates: false
}) {
    switch (subcommand) {
        case "r":
        case "rs":
        case "redirect_spawns": {
            const channelsInput = values.channelsInput;
            const channelIds = [...channelsInput.matchAll(/<#(\d+)>/g)].map(match => match[1]);

            if (channelIds.length === 0) {
                return msg.reply({ content: i18n.__('commands.config.provide_channels'), ephemeral: true });
            }

            const validChannels = [];
            for (const id of channelIds) {
                try {
                    const channel = await msg.guild.channels.fetch(id);
                    if (channel && channel.isTextBased() && channel.permissionsFor(msg.client.user)?.has("SendMessages")) {
                        validChannels.push(id);
                    }
                } catch { }
            }

            if (validChannels.length === 0) {
                return msg.reply({ content: i18n.__('commands.config.no_valid_channels'), ephemeral: true });
            }

            await upsertConfig(msg, "spawn_redirect", validChannels.join(','));
            msg.guild.configs.spawn_redirect = { config: validChannels.join(',') };

            return msg.reply(i18n.__('commands.config.success_redirect'));
        }
        case "cr":
        case "clear_redirects": {
            const deleted = await deleteConfig(msg, "spawn_redirect");
            if (deleted) {
                delete msg.guild.configs.spawn_redirect;
                return msg.reply(i18n.__('commands.config.spawns_cleared'));
            }
            return msg.reply(i18n.__('commands.config.spawns_config_notfound'));
        }
        case "l":
        case "language": {
            await upsertConfig(msg, "locale", values.language);
            msg.guild.configs.locale = { config: values.language };
            i18n.setLocale(values.language);
            return msg.reply(i18n.__('commands.config.language_set', { language: values.language }));
        }
        case "cl":
        case "clear_language": {
            const deleted = await deleteConfig(msg, "locale");
            if (deleted) {
                delete msg.guild.configs.locale;
                i18n.setLocale('en');
                return msg.reply(i18n.__('commands.config.language_cleared'));
            }
            return msg.reply(i18n.__('commands.config.language_config_notfound'));
        }
        case "bot_updates": {
            const channelsInput = values.update_channel;

            if (!channelsInput) {
                return msg.reply({ content: i18n.__('commands.config.provide_channels'), ephemeral: true });
            }

            await upsertConfig(msg, "update_channels", channelsInput.id);

            msg.guild.configs.update_channels = { config: channelsInput.id };

            return msg.reply(i18n.__('commands.config.success_update_redirect'));
        }
        case "toggle_updates": {

            await upsertConfig(msg, "toggle_updates", values.toggle_updates);

            msg.guild.configs.toggle_updates = { config: values.toggle_updates };

            return msg.reply(i18n.__('commands.config.toggle_updates_' + (values.toggle_updates ? 'enabled' : 'disabled')));

        }
    }
}

async function handleUserConfig(msg, subcommand, values = {
    'language': 'en'
}) {
    switch (subcommand) {
        case "language":
        case "l": {

            if (!msg.user.player)
                return msg.reply(i18n.__('default.no_started'));

            const [row] = await msg.client.postgres`UPDATE users SET locale = ${values.language} WHERE id = ${msg.user?.id || msg.author?.id} RETURNING *`;

            await new Player(row).sync(msg);

            i18n.setLocale(values.language);

            return msg.reply(i18n.__('commands.config.language_set_user', { language: values.language }));
        }
    }
}

async function handleChannelConfig(msg, subcommand, values = {
    'toggle_spawns': false,
    'language': 'en'
}) {
    switch (subcommand) {
        case "ts":
        case "toggle_spawns": {
            const enabled = values.toggle_spawns;

            if (enabled) {
                const deleted = await deleteConfig(msg, "spawn_disabled", true);
                if (deleted) {
                    delete msg.channel.configs.spawn_disabled;
                    return msg.reply(i18n.__('commands.config.spawns_enabled'));
                }
                return msg.reply(i18n.__('commands.config.spawns_already_enabled'));
            } else {
                await upsertConfig(msg, "spawn_disabled", "true", true);
                msg.channel.configs.spawn_disabled = { config: "true" };
                return msg.reply(i18n.__('commands.config.spawns_disabled'));
            }
        }
        case "l":
        case "language": {
            await upsertConfig(msg, "locale", values.language, true);
            msg.channel.configs.locale = { config: values.language };
            i18n.setLocale(values.language);
            return msg.reply(i18n.__('commands.config.language_set_channel', { language: values.language }));
        }
    }
}

async function handleCheckConfig(msg, subcommand) {
    if (!subcommand || subcommand === "settings") {
        const guildConfigs = await msg.client.postgres`SELECT * FROM command_configuration WHERE guild_id = ${msg.guild.id} AND channel_id IS NULL`;
        const channelConfigs = await msg.client.postgres`SELECT * FROM command_configuration WHERE channel_id = ${msg.channel.id}`;

        const possibleGuildConfigs = { "spawn_redirect": i18n.__('commands.config.server.channel_spawns_redirect'), 'locale': i18n.__("commands.config.server.server_language") };
        const possibleChannelConfigs = { "spawn_disabled": i18n.__('commands.config.channel.spawns_disabled'), 'locale': i18n.__('commands.config.channel.language') };

        const guildFields = Object.entries(possibleGuildConfigs).map(([key, name]) => {
            const config = guildConfigs.find(c => c.command === key);
            const value = config ?
                key == 'spawn_redirect' ? config.config.split(',').map(c => `<#${c}>`).join(' ') : "`" + config.config + "`"
                : "`" + i18n.__('commands.config.not_set') + "`";
            return { name: `${i18n.__('commands.config.server.title')}: ${name}`, value, inline: false };
        });

        const channelFields = Object.entries(possibleChannelConfigs).map(([key, name]) => {
            const config = channelConfigs.find(c => c.command === key);
            const value = config ? "`" + config.config + "`" : "`" + i18n.__('commands.config.unset') + "`";
            return { name: `${i18n.__('commands.config.channel.title')}: ${name}`, value, inline: false };
        });

        const embed = {
            title: i18n.__('commands.config.config_status'),
            description: i18n.__('commands.config.config_description', { channelId: msg.channel.id }),
            fields: [...guildFields, ...channelFields].filter(Boolean),
            color: 0x5865F2,
        };

        return msg.reply({ embeds: [embed] });
    } else if (subcommand === "help") {
        const embed = new EmbedBuilder()
            .setTitle(i18n.__('commands.config.help_command'))
            .setDescription(i18n.__('commands.config.help_description'))
            .setColor(0x5865F2)
            .addFields(
                {
                    name: i18n.__('commands.config.help_server_settings_title'),
                    value: i18n.__('commands.config.help_server_settings_value'),
                    inline: false
                },
                {
                    name: i18n.__('commands.config.redirect_spawns'),
                    value: i18n.__('commands.config.redirect_spawns_value'),
                    inline: false
                },
                {
                    name: i18n.__('commands.config.clear_redirects'),
                    value: i18n.__('commands.config.clear_redirects_value'),
                    inline: false
                },
                {
                    name: i18n.__('commands.config.channel_specific_title'),
                    value: i18n.__('commands.config.channel_specific_value'),
                    inline: false
                },
                {
                    name: i18n.__('commands.config.toggle_spawns'),
                    value: i18n.__('commands.config.toggle_spawns_value'),
                    inline: false
                },
                {
                    name: i18n.__('commands.config.check_config'),
                    value: i18n.__('commands.config.check_config_value'),
                    inline: false
                },
                {
                    name: i18n.__('commands.config.view_settings'),
                    value: i18n.__('commands.config.view_settings_value'),
                    inline: false
                },
                {
                    name: i18n.__('commands.config.set_bot_update_channel'),
                    value: i18n.__('commands.config.set_bot_update_channel_value'),
                    inline: false
                },
                {
                    name: i18n.__('commands.config.toggle_bot_updates'),
                    value: i18n.__('commands.config.toggle_bot_updates_value'),
                    inline: false
                },
                {
                    name: i18n.__('commands.config.get_config_help'),
                    value: i18n.__('commands.config.get_config_help_value'),
                    inline: false
                }
            );
        return msg.reply({ embeds: [embed] });
    } else {
        return msg.reply({ content: i18n.__('commands.config.invalid_check'), ephemeral: true });
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

    if (isChannel)
        whereClause.channel_id = BigInt(msg.channel.id);

    const { values, text } = builder.deletes('command_configuration').where(whereClause);
    const result = await msg.client.postgres.unsafe(text, values);
    return result.count > 0;
}