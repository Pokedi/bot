import { SlashCommandBuilder } from "discord.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription("You can configure your Pokedi to meet your needs")
        .addSubcommand(x => x.setName('check').setDescription("Check all available features"))
        .addSubcommand(x => x.setName('set').setDescription("Set or redirect pokemon to a certain channel")

            .addIntegerOption(x => x
                .setName("state")
                .setDescription("Enable [Default] or Disable")
                .addChoices({
                    name: "Enable",
                    value: 0
                }, {
                    name: "Disable",
                    value: 1
                }))

            .addStringOption(x => x
                .setName("guild_feature")
                .setDescription("What feature would you like to focus on?")
                .addChoices({
                    name: "Language",
                    value: "language"
                }, {
                    name: "Raid",
                    value: "raid"
                }, {
                    name: "Redirect Spawns",
                    value: "spawn"
                })
            )

            .addStringOption(x => x
                .setName("channel_feature")
                .setDescription("What feature would you like to focus on?")
                .addChoices({
                    name: "Raid",
                    value: "raid"
                }, {
                    name: "Allow or Disallow Spawn",
                    value: "spawn"
                }, {
                    name: "Language",
                    value: "language"
                })
            )

            .addStringOption(x => x
                .setName("channels")
                .setDescription("Channel IDs")
            )

            .addStringOption(x => x
                .setName("user_feature")
                .setDescription("Select a feature you want to modify")
                .addChoices({
                    name: "Language",
                    value: "language"
                })
            )

            .addStringOption(x => x
                .setName("language")
                .setDescription("The language the user wants to select for themselves")
                .addChoices({
                    name: "Portuguese",
                    value: "pt-BR"
                }, {
                    name: "Espenol",
                    value: "es-ES"
                }, {
                    name: "Deutsch",
                    value: "de"
                }, {
                    name: "English",
                    value: "en-US"
                }))
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
                }).setRequired(true))

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

        const enable = !msg.options.getBoolean('state');

        switch (msg.options.getSubcommand()) {
            case "set": {

                // IF Channel or Guild Config, Verify Perms
                if ((msg.options.getString("channel_feature") || msg.options.getString("guild_feature")) && !msg.memberPermissions.has('MANAGE_CHANNELS'))
                    return await msg.reply("you don't have permissions.");

                // Check if Channel Config settings
                if (msg.options.getString("channel_feature")) {

                    switch (msg.options.getString("channel_feature")) {
                        case "spawn": {


                        }
                            break;
                    }

                }

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

                            // Set
                            if (enable) {
                                if (retrievedChannels.length) {
                                    await msg.client.prisma.command_configuration.upsert({
                                        where: {
                                            guild_id: BigInt(msg.guild.id),
                                            channel_id: null,
                                            command: "spawn",
                                        },
                                        update: {
                                            config: retrievedChannels.join()
                                        },
                                        create: {
                                            guild_id: BigInt(msg.guild.id),
                                            channel_id: null,
                                            command: "spawn",
                                            config: retrievedChannels.join()
                                        }
                                    });
                                    msg.guild.configs["spawn"] = { config: retrievedChannels.join() };
                                    await msg.reply("Spawn will now be redirected to the specified channels.");
                                } else
                                    return msg.reply("No valid channels were selected");
                            } else {
                                await msg.client.prisma.command_configuration.upsert({
                                    where: {
                                        guild_id: BigInt(msg.guild.id),
                                        channel_id: null,
                                        command: "spawn",
                                    },
                                    update: {
                                        config: null,
                                        disable: true
                                    },
                                    create: {
                                        guild_id: BigInt(msg.guild.id),
                                        channel_id: null,
                                        command: "spawn",
                                        config: null,
                                        disable: true
                                    }
                                });
                                msg.guild.configs["spawn"] = { disable: true };
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
                        if (msg.options.getString("guild_feature") == "spawn" && msg.guild.info) msg.guild.info.redirects = null;
                        // Return Success
                        return msg.reply("Successfully unset your feature for your guild");
                    } else msg.reply("Nothing happened...");

                }

            }
                break;

        }
    }
}
