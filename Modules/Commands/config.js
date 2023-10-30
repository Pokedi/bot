import { SlashCommandBuilder } from "discord.js";
import builder from "../Database/QueryBuilder/queryGenerator.js";
import capitalize from "../../Utilities/Misc/capitalize.js";

// To-Do: SubCommandGroup -> SubCommand -> Command approach

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription("You can configure your Pokedi to meet your needs")
        .addSubcommand(x =>
            x.setName('check')
                .setNameLocalizations({
                    "de": "konfig"
                })
                .setDescription("Check all available features")
        )
        .addSubcommand(x => x.setName('set')
            .setDescription("Set or redirect pokemon to a certain channel")
            .addIntegerOption(x => x
                .setName("state")
                .setDescription("1. Enable [Default] or Disable")
                .addChoices({
                    name: "Enable",
                    value: 0
                }, {
                    name: "Disable",
                    value: 1
                }))

            .addStringOption(x => x
                .setName("guild_feature")
                .setDescription("2. What feature would you like to focus on?")
                .addChoices(
                    //     {
                    //     name: "Language",
                    //     value: "language"
                    // }, {
                    //     name: "Raid",
                    //     value: "raid"
                    // }, 
                    {
                        name: "Redirect Spawns",
                        value: "spawn"
                    }
                )
            )

            // .addStringOption(x => x
            //     .setName("channel_feature")
            //     .setDescription("2. What feature would you like to focus on?")
            //     .addChoices(
            //         {
            //         name: "Raid",
            //         value: "raid"
            //     },
            //      {
            //         name: "Allow or Disallow Spawn",
            //         value: "spawn"
            //     }, {
            //         name: "Language",
            //         value: "language"
            //     })
            // )

            // .addStringOption(x => x
            //     .setName("user_feature")
            //     .setDescription("3. Select a feature you want to modify")
            //     .addChoices({
            //         name: "Language",
            //         value: "language"
            //     })
            // )

            .addStringOption(x => x
                .setName("channels")
                .setDescription("4. Channel IDs")
            )

            // .addStringOption(x => x
            //     .setName("language")
            //     .setDescription("4. The language the user wants to select for themselves")
            //     .addChoices({
            //         name: "Portuguese",
            //         value: "pt-BR"
            //     }, {
            //         name: "Espenol",
            //         value: "es-ES"
            //     }, {
            //         name: "Deutsch",
            //         value: "de"
            //     }, {
            //         name: "English",
            //         value: "en-US"
            //     }))
        )
        .addSubcommand(x => x
            .setName('unset')
            .setDescription("Unset the redirect or raid of the server")
            .addStringOption(x => x
                .setName("channel_feature")
                .setDescription("What feature would you like to focus unset?")
                .addChoices({
                    name: "Raid",
                    value: "raid"
                }, {
                    name: "Spawn",
                    value: "spawn"
                }, {
                    name: "Language",
                    value: "language"
                }))

            .addStringOption(x => x
                .setName("user_feature")
                .setDescription("Select a feature you want to unset.")
                .addChoices({
                    name: "Language",
                    value: "language"
                })
            )

            .addStringOption(x => x
                .setName("guild_feature")
                .setDescription("What feature would you like to unset?")
                .addChoices({
                    name: "Language",
                    value: "language"
                }, {
                    name: "Raid",
                    value: "raid"
                }, {
                    name: "Unset Spawn Redirection",
                    value: "spawn"
                })
            )
        ),
    async execute(msg = new CommandInteraction()) {

        const enable = !msg.options.getInteger('state');

        switch (msg.options.getSubcommand()) {
            case "set": {

                // IF Channel or Guild Config, Verify Perms
                if ((msg.options.getString("channel_feature") || msg.options.getString("guild_feature")) && !msg.memberPermissions.has('MANAGE_CHANNELS'))
                    return await msg.reply("you don't have permissions.");

                // Check if Channel Config settings TO-DO


                // Check if Channel Config settings
                if (msg.options.getString("guild_feature")) {

                    switch (msg.options.getString("guild_feature")) {
                        case "spawn": {

                            const channels = msg.options.getString('channels');

                            // Reject enabling without channels
                            if (enable && !channels)
                                return msg.reply("Please mention a channel or two");

                            const retrievedChannels = [];
                            // Force cache all given channels
                            if (enable && channels) {
                                // Scan for Channels
                                for (const channel_id of channels.match(/\d+/gim)) {
                                    try {
                                        // Check if Channel exists
                                        const verifiedChannel = await msg.client.channels.fetch(channel_id);
                                        // Push to Array if exists + Make sure channel belongs to guild
                                        if (verifiedChannel.id && verifiedChannel.guild.id == msg.guild.id)
                                            retrievedChannels.push(verifiedChannel.id);
                                    } catch (err) {
                                        console.log(err, "IN CONFIG");
                                    } finally { }
                                }
                            }

                            // Found Config for ID
                            const [foundConfig] = await msg.client.postgres`SELECT * FROM command_configuration WHERE guild_id = ${msg.guild.id} AND channel_id = ${null} AND command = 'spawn' LIMIT 1`;

                            // Set
                            if (enable) {
                                // IF Channels exist
                                if (retrievedChannels.length) {
                                    // IF No config then create
                                    if (!foundConfig) {
                                        // Ready Query Engine
                                        const { values, text } = builder.insert('command_configuration', {
                                            guild_id: BigInt(msg.guild.id),
                                            channel_id: null,
                                            command: "spawn",
                                            config: retrievedChannels.join()
                                        }).returning("*");

                                        // Use Unsafe to Execute Query
                                        const [row] = await msg.client.postgres.unsafe(text, values);

                                        // Save Query to Guild Config
                                        msg.guild.configs["spawn"] = row;
                                    } else {
                                        // Update if Found + Ready Query Engine
                                        const { values, text } = builder.update('command_configuration', {
                                            guild_id: BigInt(msg.guild.id),
                                            channel_id: null,
                                            command: "spawn",
                                            config: retrievedChannels.join()
                                        }).where({ id: foundConfig.id }).returning("*");

                                        // Use Unsafe to Execute Query
                                        const [row] = await msg.client.postgres.unsafe(text, values);

                                        // Reassign
                                        msg.guild.configs["spawn"].config = retrievedChannels.join();
                                    }
                                    // Message
                                    await msg.reply("Spawn will now be redirected to the specified channels.");
                                } else
                                    // Reject
                                    return msg.reply("No valid channels were selected");
                            } else {
                                // Disable
                                // IF Not Found
                                if (!foundConfig) {
                                    // Create
                                    // Ready Query Engine
                                    const { values, text } = builder.insert('command_configuration', {
                                        guild_id: BigInt(msg.guild.id),
                                        channel_id: null,
                                        command: "spawn",
                                        disabled: true,
                                        config: null
                                    }).returning("*");

                                    // Use Unsafe to Execute Query
                                    const [row] = await msg.client.postgres.unsafe(text, values);

                                    msg.guild.configs["spawn"] = row
                                } else {
                                    // Update if Found + Ready Query Engine
                                    const { values, text } = builder.update('command_configuration', {
                                        guild_id: BigInt(msg.guild.id),
                                        channel_id: null,
                                        command: "spawn",
                                        config: null,
                                        disabled: true
                                    }).where({ id: foundConfig.id }).returning("*");

                                    // Use Unsafe to Execute Query
                                    const [row] = await msg.client.postgres.unsafe(text, values);

                                    msg.guild.configs["spawn"] = { disable: true };
                                }
                                return await msg.reply("Spawns were disabled on your server.");
                            }
                        }
                            break;
                    }
                }

            }
                break;

            case "unset": {

                // Channel Features
                if (msg.options.getString("channel_feature")) {

                    // Check if User has Perms to use command
                    if (!msg.memberPermissions.has('MANAGE_CHANNELS'))
                        return await msg.reply("you don't have permissions.");

                    // Select Command Config
                    const [exists] = await msg.client.postgres`SELECT true FROM command_configuration WHERE channel_id = ${msg.channel.id} AND command = ${msg.options.getString("channel_feature")}`;
                    if (exists) {
                        await sql`DELETE FROM command_configuration WHERE channel_id = ${msg.guild.id} AND command = ${msg.options.getString("channel_feature")}`;
                        if (msg.channel.info) delete msg.channel.info[msg.options.getString("channel_feature")];
                        return msg.reply("Successfully unset your feature for your guild");
                    } else msg.reply("Nothing happened...");

                }

                // Guild Unset
                if (msg.options.getString("guild_feature")) {

                    // Check if User has Perms to use command
                    if (!msg.memberPermissions.has('MANAGE_CHANNELS'))
                        return await msg.reply("you don't have permissions.");

                    // Select Command Config
                    const [exists] = await msg.client.postgres`SELECT true FROM command_configuration WHERE guild_id = ${msg.guild.id} AND command = ${msg.options.getString("guild_feature")}`;
                    if (exists) {
                        // Remove Config
                        await msg.client.postgres`DELETE FROM command_configuration WHERE guild_id = ${msg.guild.id} AND command = ${msg.options.getString("guild_feature")}`;
                        // If unset guild spawn redirection, unassign
                        if (msg.options.getString("guild_feature") == "spawn" && msg.guild.info) msg.guild.configs.spawn = undefined;
                        // Return Success
                        return msg.reply("Successfully unset your feature for your guild");
                    } else msg.reply("Nothing happened...");

                }

            }
                break;

            case "check": {

                const foundConfig = await msg.client.postgres`SELECT * FROM command_configuration WHERE (guild_id = ${msg.guild.id} AND channel_id is null) OR channel_id = ${msg.channel.id}`;

                const fields = [foundConfig.filter(x => !x.channel_id).length ? {
                    title: "Guild Configurations",
                    description: "Please make sure to use these commands carefully.",
                    fields: foundConfig.filter(x => !x.channel_id).map(x => ({
                        name: capitalize(x.command),
                        value: "```\n" + x.config + "\n```"
                    }))
                } : undefined, foundConfig.filter(x => x.channel_id).length ? {
                    title: "Channel Configurations",
                    description: "Please make sure to use these commands carefully.",
                    fields: foundConfig.filter(x => !x.channel_id).map(x => ({
                        name: capitalize(x.command),
                        value: "```\n" + x.config + "\n```"
                    }))
                } : undefined].filter(x => x);

                return await msg.reply(fields[0] ? {
                    embeds: fields
                } : "No Configurations Found...");

            }
                break;

        }
    }
}
