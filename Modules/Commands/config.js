import { SlashCommandBuilder } from "discord.js";
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
            'es-ES': 'Puedes configurar tu Pokedi para satisfacer tus necesidades',
            'de': 'Sie können Ihren Pokedi an Ihre Bedürfnisse anpassen',
            'fr': 'Vous pouvez configurer votre Pokedi pour répondre à vos besoins',
        })
        .addSubcommandGroup(group => group
            .setName("server")
            .setDescription("Configure server-wide settings")
            .addSubcommand(subcommand => subcommand
                .setName("redirect_spawns")
                .setDescription("Redirect all spawns to specific channels.")
                .addStringOption(option => option
                    .setName("channels")
                    .setDescription("The channels to redirect spawns to (use #channel mentions).")
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName("clear_redirects")
                .setDescription("Clear spawn redirection settings for the server.")
            )
        )
        .addSubcommandGroup(group => group
            .setName("channel")
            .setDescription("Configure channel-specific settings")
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
            )
        ),

    async execute(msg) {
        if (!msg.member.permissions.has("ManageGuild")) {
            return msg.reply({ content: "You need the 'Manage Server' permission to use this command.", ephemeral: true });
        }

        const group = msg.options.getSubcommandGroup();
        const subcommand = msg.options.getSubcommand();

        try {
            switch (group) {
                case "server":
                    await handleServerConfig(msg, subcommand);
                    break;
                case "channel":
                    await handleChannelConfig(msg, subcommand);
                    break;
                case "check":
                    await handleCheckConfig(msg);
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

async function handleServerConfig(msg, subcommand) {
    switch (subcommand) {
        case "redirect_spawns": {
            const channelsInput = msg.options.getString("channels");
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

async function handleChannelConfig(msg, subcommand) {
    switch (subcommand) {
        case "toggle_spawns": {
            const enabled = msg.options.getBoolean("enabled");

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

async function handleCheckConfig(msg) {
    const guildConfigs = await msg.client.postgres`SELECT * FROM command_configuration WHERE guild_id = ${msg.guild.id} AND channel_id IS NULL`;
    const channelConfigs = await msg.client.postgres`SELECT * FROM command_configuration WHERE channel_id = ${msg.channel.id}`;

    const possibleGuildConfigs = { "spawn_redirect": "Spawn Redirect Channels" };
    const possibleChannelConfigs = { "spawn_disabled": "Spawns Disabled" };

    const guildFields = Object.entries(possibleGuildConfigs).map(([key, name]) => {
        const config = guildConfigs.find(c => c.command === key);
        const value = config ? config.config.split(',').map(c => `<#${c}>`).join(' ') : "`Not Set`";
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
}

async function upsertConfig(msg, command, configValue, isChannel = false) {
    const postgres = msg.client.postgres;

    const whereClause = {
        guild_id: BigInt(msg.guild.id),
        command: command,
        channel_id: isChannel ? BigInt(msg.channel.id) : null,
    };

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
        command: command,
        channel_id: isChannel ? BigInt(msg.channel.id) : null,
    };

    const { values, text } = builder.deletes('command_configuration').where(whereClause);
    const result = await msg.client.postgres.unsafe(text, values);

    return result.count > 0;
}