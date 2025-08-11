import { ApplicationCommandPermissionType, SlashCommandBuilder } from "discord.js";
import builder from "../Database/QueryBuilder/queryGenerator.js";
import capitalize from "../../Utilities/Misc/capitalize.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName("config")
        .setNameLocalizations({
            'pt-BR': 'configurar',
            'es-ES': 'configurar',
            'de': 'konfigurieren',
            'fr': 'configurer',
            'ar': 'ضبط'
        })
        .setDescription("You can configure your Pokedi to meet your needs")
        .setDescriptionLocalizations({
            'pt-BR': 'Você pode configurar seu Pokedi para atender às suas necessidades',
            'es-ES': 'Puedes configurar tu Pokedi para satisfacer tus necesidades',
            'de': 'Sie können Ihren Pokedi an Ihre Bedürfnisse anpassen',
            'fr': 'Vous pouvez configurer votre Pokedi pour répondre à vos besoins',
            'ar': 'يمكنك تكوين Pokedi الخاص بك لتلبية احتياجاتك'
        })
        .addSubcommandGroup(x => x
            .setName("options")
            .setNameLocalizations({
                'pt-BR': 'opcoes',
                'es-ES': 'opciones',
                'de': 'optionen',
                'fr': 'options',
                'ar': 'خيارات'
            })
            .setDescription("Configure the following Groups")
            .setDescriptionLocalizations({
                'pt-BR': 'Configure os seguintes grupos',
                'es-ES': 'Configurar los siguientes grupos',
                'de': 'Konfigurieren Sie die folgenden Gruppen',
                'fr': 'Configurer les groupes suivants',
                'ar': 'تكوين المجموعات التالية'
            })
            .addSubcommand(y => y
                .setName("server")
                .setNameLocalizations({
                    'pt-BR': 'servidor',
                    'es-ES': 'servidor',
                    'de': 'server',
                    'fr': 'serveur',
                    'ar': 'الخادم'
                })
                .setDescription("Configure Server Settings")
                .setDescriptionLocalizations({
                    'pt-BR': 'Configurar as configurações do servidor',
                    'es-ES': 'Configurar los ajustes del servidor',
                    'de': 'Servereinstellungen konfigurieren',
                    'fr': 'Configurer les paramètres du serveur',
                    'ar': 'تكوين إعدادات الخادم'
                })
                .addStringOption(z => z
                    .setName("redirect-channel")
                    .setNameLocalizations({
                        'pt-BR': 'redirecionar-canal',
                        'es-ES': 'redirigir-canal',
                        'de': 'kanal-umleiten',
                        'fr': 'rediriger-canal',
                        'ar': 'إعادة-توجيه-القناة'
                    })
                    .setDescription("Redirect all spawns to specified Channels")
                    .setDescriptionLocalizations({
                        'pt-BR': 'Redirecionar todos os spawns para canais especificados',
                        'es-ES': 'Redirigir todos los spawns a canales especificados',
                        'de': 'Leiten Sie alle Spawns an bestimmte Kanäle weiter',
                        'fr': 'Rediriger toutes les apparitions vers des canaux spécifiés',
                        'ar': 'إعادة توجيه جميع عمليات الظهور إلى قنوات محددة'
                    })
                )
                .addBooleanOption(z => z
                    .setName("clear-redirect")
                    .setNameLocalizations({
                        'pt-BR': 'limpar-redirecionamento',
                        'es-ES': 'limpiar-redireccionamiento',
                        'de': 'umleitung-löschen',
                        'fr': 'effacer-redirection',
                        'ar': 'مسح-إعادة-التوجيه'
                    })
                    .setDescription("Clear your Redirects")
                    .setDescriptionLocalizations({
                        'pt-BR': 'Limpar seus redirecionamentos',
                        'es-ES': 'Borra tus redireccionamientos',
                        'de': 'Löschen Sie Ihre Weiterleitungen',
                        'fr': 'Effacez vos redirections',
                        'ar': 'مسح عمليات إعادة التوجيه الخاصة بك'
                    })
                )
                .addBooleanOption(z => z
                    .setName("server-mode")
                    .setNameLocalizations({
                        'pt-BR': 'modo-servidor',
                        'es-ES': 'modo-servidor',
                        'de': 'server-modus',
                        'fr': 'mode-serveur',
                        'ar': 'وضع-الخادم'
                    })
                    .setDescription("Isolate the entire Pokedi experience just for your own Server!")
                    .setDescriptionLocalizations({
                        'pt-BR': 'Isole toda a experiência Pokedi apenas para o seu próprio servidor!',
                        'es-ES': '¡Aísla toda la experiencia Pokedi solo para tu propio servidor!',
                        'de': 'Isolieren Sie das gesamte Pokedi-Erlebnis nur für Ihren eigenen Server!',
                        'fr': 'Isolez toute l\'expérience Pokedi uniquement pour votre propre serveur!',
                        'ar': 'اعزل تجربة Pokedi بأكملها لخادمك الخاص فقط!'
                    })
                )
            )
            .addSubcommand(y => y
                .setName("channel")
                .setNameLocalizations({
                    'pt-BR': 'canal',
                    'es-ES': 'canal',
                    'de': 'kanal',
                    'fr': 'canal',
                    'ar': 'قناة'
                })
                .setDescription("Configure Channel Settings")
                .setDescriptionLocalizations({
                    'pt-BR': 'Configurar as configurações do canal',
                    'es-ES': 'Configurar los ajustes del canal',
                    'de': 'Kanaleinstellungen konfigurieren',
                    'fr': 'Configurer les paramètres du canal',
                    'ar': 'تكوين إعدادات القناة'
                })
                .addStringOption(z => z
                    .setDescription("Disable the given Command on this Channel")
                    .setDescriptionLocalizations({
                        'pt-BR': 'Desative o comando fornecido neste canal',
                        'es-ES': 'Deshabilita el comando dado en este canal',
                        'de': 'Deaktivieren Sie den angegebenen Befehl auf diesem Kanal',
                        'fr': 'Désactiver la commande donnée sur ce canal',
                        'ar': 'عطّل الأمر المحدد في هذه القناة'
                    })
                    .setName("disable-command")
                    .setNameLocalizations({
                        'pt-BR': 'desativar-comando',
                        'es-ES': 'desactivar-comando',
                        'de': 'befehl-deaktivieren',
                        'fr': 'désactiver-commande',
                        'ar': 'تعطيل-الأمر'
                    })
                    .setMaxLength(20)
                )
                .addStringOption(z => z
                    .setDescription("Clear permissionOverrides on this Channel for the given command")
                    .setDescriptionLocalizations({
                        'pt-BR': 'Limpar permissionOverrides neste canal para o comando fornecido',
                        'es-ES': 'Borrar permissionOverrides en este canal para el comando dado',
                        'de': 'Löschen Sie permissionOverrides auf diesem Kanal für den angegebenen Befehl',
                        'fr': 'Effacer les permissionOverrides sur ce canal pour la commande donnée',
                        'ar': 'مسح تجاوزات الأذونات على هذه القناة للأمر المحدد'
                    })
                    .setName("clear-command")
                    .setNameLocalizations({
                        'pt-BR': 'limpar-comando',
                        'es-ES': 'limpiar-comando',
                        'de': 'befehl-löschen',
                        'fr': 'effacer-commande',
                        'ar': 'مسح-الأمر'
                    })
                    .setMaxLength(20)
                )
            )
        )
        .addSubcommandGroup(x => x
            .setName('check')
            .setNameLocalizations({
                "de": "konfig",
                'pt-BR': 'verificar',
                'es-ES': 'verificar',
                'fr': 'vérifier',
                'ar': 'تحقق'
            })
            .setDescription("Check all available features")
            .setDescriptionLocalizations({
                'pt-BR': 'Verificar todos os recursos disponíveis',
                'es-ES': 'Verificar todas las funciones disponibles',
                'de': 'Überprüfen Sie alle verfügbaren Funktionen',
                'fr': 'Vérifier toutes les fonctionnalités disponibles',
                'ar': 'تحقق من جميع الميزات المتاحة'
            })
            .addSubcommand(y => y.setName("all")
                .setNameLocalizations({
                    'pt-BR': 'todos',
                    'es-ES': 'todos',
                    'de': 'alle',
                    'fr': 'tout',
                    'ar': 'الكل'
                })
                .setDescription("Check All Configurations available")
                .setDescriptionLocalizations({
                    'pt-BR': 'Verificar todas as configurações disponíveis',
                    'es-ES': 'Verificar todas las configuraciones disponibles',
                    'de': 'Überprüfen Sie alle verfügbaren Konfigurationen',
                    'fr': 'Vérifier toutes les configurations disponibles',
                    'ar': 'تحقق من جميع التكوينات المتاحة'
                })
            )
        ),
    async execute(msg) {

        switch (msg.options.getSubcommandGroup()) {

            case "options":
                switch (msg.options.getSubcommand()) {

                    case "server": {

                        // IF Channel or Guild Config, Verify Perms
                        if (!msg.channel.permissionsFor(msg.member).has("ManageChannels"))
                            return await msg.reply("you do not have the necessary permissions.");

                        // if (!msg.channel.permissionsFor(msg.guild.members.me).has("ManageGuild"))
                        //     return await msg.reply("I do not have the permission to Manage your Server.");

                        const firstCommand = msg.options._hoistedOptions[0]?.name;

                        switch (firstCommand) {

                            case "server-mode": {

                                const { approximateMemberCount } = await msg.guild.fetch();

                                // await msg.client.postgres`UPDATE guilds SET mode = 1 WHERE id = ${msg.guild.id}`;

                                return msg.reply("This command is not available for you yet.")

                            }
                            
                            case "redirect-channel":
                                // Retrieved Channels Text
                                const channels = msg.options.getString("redirect-channel");

                                if (!channels)
                                    return msg.reply("You must mention channels you wish to redirect to");

                                // Ready Array for Valid Channels
                                const retrievedChannels = [];
                                // Force cache all given channels

                                // Scan for Channels
                                for (const channel_id of channels.match(/\d+/gim)) {
                                    try {
                                        // Check if Channel exists
                                        const verifiedChannel = await msg.client.channels.fetch(channel_id);
                                        // Push to Array if exists + Make sure channel belongs to guild
                                        if (verifiedChannel.id && verifiedChannel.guild.id == msg.guild.id && verifiedChannel.isTextBased())
                                            retrievedChannels.push(verifiedChannel.id);
                                    } catch (err) {
                                        console.log(err, "IN CONFIG");
                                    } finally { }
                                }

                                if (!retrievedChannels.length)
                                    return await msg.reply("You did not mention any valid channels...");

                                // Found Config for ID
                                const [foundConfig] = await msg.client.postgres`SELECT * FROM command_configuration WHERE guild_id = ${msg.guild.id} AND channel_id = ${null} AND command = 'spawn' LIMIT 1`;

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
                                return await msg.reply("Spawn will now be redirected to the specified channels.");

                            case "clear-redirect":

                                // Select Command Config
                                const [exists] = await msg.client.postgres`SELECT true FROM command_configuration WHERE guild_id = ${msg.guild.id} AND command = 'spawn'`;
                                if (exists) {
                                    // Remove Config
                                    await msg.client.postgres`DELETE FROM command_configuration WHERE guild_id = ${msg.guild.id} AND command = 'spawn'`;
                                    // If unset guild spawn redirection, unassign
                                    msg.guild.configs.spawn = undefined;
                                    // Return Success
                                    return msg.reply("Spawns have been reset.");
                                } else
                                    return msg.reply("Nothing happened...");

                            default:
                                return await msg.reply("Invalid Command Usage");
                        }
                    }

                    case "channel": {

                        // IF Channel or Guild Config, Verify Perms
                        if (!msg.channel.permissionsFor(msg.member).has("ManageChannels"))
                            return await msg.reply("you do not have the necessary permissions.");

                        if (!msg.channel.permissionsFor(msg.guild.members.me).has("ManageChannels"))
                            return await msg.reply("I do not have the Permissions to manage your Channels");

                        const commandObject = msg.client.commands.get(msg.options.getString("disable-command") || msg.options.getString("clear-command"))?.rest;

                        const _id = commandObject?.id;

                        if (!_id)
                            return await msg.reply("That command does not exist");

                        if (commandObject.name == "config")
                            return await msg.reply("You must manually modify the permissions of this command to avoid madness");

                        const firstCommand = msg.options._hoistedOptions[0]?.name;

                        switch (firstCommand) {

                            case "disable-command":
                                return await msg.reply(`Since Discord no longer allows me to modify command permissions, please go to your [Server's Application Directory](<discord://-/guilds/${msg.guild.id}/settings/integrations>), look for Pokedi and do whatever you deem necessary!`);
                            // await msg.guild.commands.permissions.add({
                            //     command: _id,
                            //     token: process.env.TOKEN,
                            //     permissions: [{
                            //         id: msg.channel.id,
                            //         type: ApplicationCommandPermissionType.Channel,
                            //         permission: false
                            //     }]
                            // });
                            // return await msg.reply(`Successfully disabled /${commandObject.name} for this channel`);

                            case "clear-command":
                                return await msg.reply(`Since Discord no longer allows me to modify command permissions, please go to your [Server's Application Directory](<discord://-/guilds/${msg.guild.id}/settings/integrations>), look for Pokedi and do whatever you deem necessary!`);
                            // await msg.guild.commands.permissions.remove({
                            //     command: _id,
                            //     token: process.env.TOKEN,
                            //     channels: [msg.channel.id],
                            // });
                            // return await msg.reply(`Successfully reset /${commandObject.name} for this channel.`);

                            default:
                                return await msg.reply("Invalid Command Usage");
                        }
                    }

                }
                break;

            // Check Configurations Available
            case "check":

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

            // Default if Nothing was Mentioned
            default:
                return await msg.reply({
                    embeds: [{
                        title: "Welcome to the Configuration Panel",
                        description: "Here are few ways to jumpstart on configuring Pokedi!",
                        fields: [{
                            name: "Redirect Spawn to Channels",
                            value: `</config options server:${msg.commandId}> channels: Mention some Channels Here`
                        }, {
                            name: "Clear Channel Redirects",
                            value: `</config options server:${msg.commandId}> clear-redirect: True`
                        }]
                    }]
                });
        }
        /*
        // The Following Configs are a To-Do
        // Please Ignore :D
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
            // .addStringOption(x => x
            //     .setName("channel_feature")
            //     .setDescription("What feature would you like to focus unset?")
            //     .addChoices(
            //         {
            //             name: "Raid",
            //             value: "raid"
            //         },
            //         {
            //             name: "Spawn",
            //             value: "spawn"
            //         }
            //         , {
            //             name: "Language",
            //             value: "language"
            //         }
            //     ))

            // .addStringOption(x => x
            //     .setName("user_feature")
            //     .setDescription("Select a feature you want to unset.")
            //     .addChoices({
            //         name: "Language",
            //         value: "language"
            //     })
            // )

            .addStringOption(x => x
                .setName("guild_feature")
                .setDescription("What feature would you like to unset?")
                .addChoices(
                    //     {
                    //         name: "Language",
                    //         value: "language"
                    //     }, {
                    //     name: "Raid",
                    //     value: "raid"
                    // },
                    {
                        name: "Unset Spawn Redirection",
                        value: "spawn"
                    })
            )
        )
        */
    }
}
