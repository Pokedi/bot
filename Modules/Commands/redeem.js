import { MessageFlags, SlashCommandBuilder } from "discord.js";
import Player from "../../Classes/player.js";
import Pokedex from "../../Classes/pokedex.js";
import capitalize from "../../Utilities/Misc/capitalize.js";
import { Chance } from "chance";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('redeem').setNameLocalizations({
            "es-ES": "redimir",
            "pt-BR": "resgate",
            "de": "gutscheineinlösen",
            "fr": "échanger",
            // "ar": "استرداد"
        }).setDescription("Redeems are a special currency obtainable through donating")
        .setDescriptionLocalizations({
            "pt-BR": "Resgates são uma moeda especial que pode ser obtida através de doações",
            "es-ES": "Los canjes son una moneda especial que se puede obtener mediante donaciones",
            "de": "Einlösungen sind eine spezielle Währung, die durch Spenden erhältlich ist",
            "fr": "Les échanges sont une monnaie spéciale que l'on peut obtenir en faisant un don",
            // "ar": "الاسترداد هو عملة خاصة يمكن الحصول عليها من خلال التبرع"
        })
        .addSubcommand(option => option
            .setName("info")
            .setNameLocalizations({
                "pt-BR": "info",
                "es-ES": "info",
                "de": "info",
                "fr": "info",
                // "ar": "معلومات"
            })
            .setDescription("Check out what you can do with your redeems!")
            .setDescriptionLocalizations({
                "pt-BR": "Confira o que você pode fazer com seus resgates!",
                "es-ES": "¡Mira lo que puedes hacer con tus canjes!",
                "de": "Schau dir an, was du mit deinen Einlösungen machen kannst!",
                "fr": "Découvrez ce que vous pouvez faire avec vos échanges!",
                // "ar": "تحقق مما يمكنك فعله باسترداداتك!"
            })
        )
        .addSubcommand(option => option
            .setName("gift")
            .setNameLocalizations({
                "pt-BR": "presente",
                "es-ES": "regalo",
                "de": "geschenk",
                "fr": "cadeau",
                // "ar": "هدية"
            })
            .setDescription("Gift someone a Redeem or Credits! (1 redeem per usage)")
            .setDescriptionLocalizations({
                "pt-BR": "Presenteie alguém com um Resgate ou Créditos! (1 resgate por uso)",
                "es-ES": "¡Regala a alguien un Canje o Créditos! (1 canje por uso)",
                "de": "Schenke jemandem eine Einlösung oder Credits! (1 Einlösung pro Nutzung)",
                "fr": "Offrez à quelqu'un un Échange ou des Crédits! (1 échange par utilisation)",
                // "ar": "أهدِ شخصًا ما استردادًا أو أرصدة! (استرداد واحد لكل استخدام)"
            })
            .addUserOption(x => x
                .setName("credits")
                .setNameLocalizations({
                    "pt-BR": "creditos",
                    "es-ES": "creditos",
                    "de": "credits",
                    "fr": "crédits",
                    // "ar": "أرصدة"
                })
                .setDescription("Gift 10K Credits to someone.")
                .setDescriptionLocalizations({
                    "pt-BR": "Presenteie 10K de Créditos para alguém.",
                    "es-ES": "Regala 10K Créditos a alguien.",
                    "de": "Schenke jemandem 10.000 Credits.",
                    "fr": "Offrez 10K Crédits à quelqu'un.",
                    // "ar": "أهدِ 10 آلاف رصيد لشخص ما."
                })
            )
            .addUserOption(x => x
                .setName("redeem")
                .setNameLocalizations({
                    "pt-BR": "resgate",
                    "es-ES": "canje",
                    "de": "einlösen",
                    "fr": "échanger",
                    // "ar": "استرداد"
                })
                .setDescription("Gift someone a Redeem (Please remember that this command is limited to one redeem per usage)")
                .setDescriptionLocalizations({
                    "pt-BR": "Presenteie alguém com um Resgate (Lembre-se que este comando é limitado a um resgate por uso)",
                    "es-ES": "Regala a alguien un Canje (Recuerda que este comando está limitado a un canje por uso)",
                    "de": "Schenke jemandem eine Einlösung (Bitte denke daran, dass dieser Befehl auf eine Einlösung pro Nutzung beschränkt ist)",
                    "fr": "Offrez à quelqu'un un Échange (N'oubliez pas que cette commande est limitée à un échange par utilisation)",
                    // "ar": "أهدِ شخصًا ما استردادًا (يرجى تذكر أن هذا الأمر يقتصر على استرداد واحد لكل استخدام)"
                })
            )
        )
        .addSubcommand(option => option
            .setName("self")
            .setNameLocalizations({
                "pt-BR": "para-si",
                "es-ES": "para-ti",
                "de": "selbst",
                "fr": "pour-soi",
                // "ar": "لنفسك"
            })
            .setDescription("Get credits or a Pokemon! (1 redeem per usage)")
            .setDescriptionLocalizations({
                "pt-BR": "Obtenha créditos ou um Pokémon! (1 resgate por uso)",
                "es-ES": "¡Obtén créditos o un Pokémon! (1 canje por uso)",
                "de": "Hol dir Credits oder ein Pokémon! (1 Einlösung pro Nutzung)",
                "fr": "Obtenez des crédits ou un Pokémon! (1 échange par utilisation)",
                // "ar": "احصل على أرصدة أو بوكيمون! (استرداد واحد لكل استخدام)"
            })
            .addBooleanOption(x => x
                .setName("credits")
                .setNameLocalizations({
                    "pt-BR": "creditos",
                    "es-ES": "creditos",
                    "de": "credits",
                    "fr": "crédits",
                    // "ar": "أرصدة"
                })
                .setDescription("Get 10K Credits.")
                .setDescriptionLocalizations({
                    "pt-BR": "Obtenha 10K de Créditos.",
                    "es-ES": "Obtén 10K Créditos.",
                    "de": "Hol dir 10.000 Credits.",
                    "fr": "Obtenez 10K Crédits.",
                    // "ar": "احصل على 10 آلاف رصيد."
                })
            )
            .addStringOption(x => x
                .setName("spawn")
                .setNameLocalizations({
                    "pt-BR": "aparecer",
                    "es-ES": "aparecer",
                    "de": "spawnen",
                    "fr": "apparition",
                    // "ar": "ظهور"
                })
                .setDescription("Write down the name of the Pokemon you wish to spawn.")
                .setDescriptionLocalizations({
                    "pt-BR": "Escreva o nome do Pokémon que você deseja que apareça.",
                    "es-ES": "Escribe el nombre del Pokémon que deseas que aparezca.",
                    "de": "Schreibe den Namen des Pokémon auf, das du spawnen lassen möchtest.",
                    "fr": "Notez le nom du Pokémon que vous souhaitez faire apparaître.",
                    // "ar": "اكتب اسم البوكيمون الذي ترغب في ظهوره."
                })
            )
            .addStringOption(x => x
                .setName("get-pokemon")
                .setNameLocalizations({
                    "pt-BR": "obter-pokemon",
                    "es-ES": "obtener-pokemon",
                    "de": "pokemon-erhalten",
                    "fr": "obtenir-pokemon",
                    // "ar": "الحصول-على-بوكيمون"
                })
                .setDescription("Write down the name of the Pokemon you wish.")
                .setDescriptionLocalizations({
                    "pt-BR": "Escreva o nome do Pokémon que você deseja.",
                    "es-ES": "Escribe el nombre del Pokémon que deseas.",
                    "de": "Schreibe den Namen des gewünschten Pokémon auf.",
                    "fr": "Notez le nom du Pokémon que vous souhaitez.",
                    // "ar": "اكتب اسم البوكيمون الذي تريده."
                })
            )
        )
        .addSubcommand(option => option
            .setName("event")
            .setNameLocalizations({
                "pt-BR": "evento",
                "es-ES": "evento",
                "de": "event",
                "fr": "événement",
                // "ar": "حدث"
            })
            .setDescription("Buy and Sell Event Deems to get Event Pokemon!")
            .setDescriptionLocalizations({
                "pt-BR": "Compre e venda Deems de Evento para obter Pokémon de Evento!",
                "es-ES": "¡Compra y vende Deems de Evento para conseguir Pokémon de Evento!",
                "de": "Kaufe und verkaufe Event-Deems, um Event-Pokémon zu erhalten!",
                "fr": "Achetez et vendez des Deems d'événement pour obtenir des Pokémon d'événement!",
                // "ar": "شراء وبيع Deems الحدث للحصول على بوكيمون الحدث!"
            })
            .addBooleanOption(x => x
                .setName("buy")
                .setNameLocalizations({
                    "pt-BR": "comprar",
                    "es-ES": "comprar",
                    "de": "kaufen",
                    "fr": "acheter",
                    // "ar": "شراء"
                })
                .setDescription("Buy Special Deems for 2 redeems")
                .setDescriptionLocalizations({
                    "pt-BR": "Compre Deems Especiais por 2 resgates",
                    "es-ES": "Compra Deems Especiales por 2 canjes",
                    "de": "Kaufe spezielle Deems für 2 Einlösungen",
                    "fr": "Achetez des Deems spéciaux pour 2 échanges",
                    // "ar": "شراء Deems خاصة مقابل 2 استرداد"
                })
            )
            .addIntegerOption(x => x
                .setName("amount")
                .setNameLocalizations({
                    "pt-BR": "quantidade",
                    "es-ES": "cantidad",
                    "de": "menge",
                    "fr": "montant",
                    // "ar": "كمية"
                })
                .setDescription("The amount of Special Deems you plan to get.")
                .setDescriptionLocalizations({
                    "pt-BR": "A quantidade de Deems Especiais que você planeja obter.",
                    "es-ES": "La cantidad de Deems Especiales que planeas obtener.",
                    "de": "Die Menge an speziellen Deems, die du erhalten möchtest.",
                    "fr": "Le montant de Deems spéciaux que vous prévoyez d'obtenir.",
                    // "ar": "كمية Deems الخاصة التي تخطط للحصول عليها."
                })
                .setMinValue(1)
                .setMaxValue(10)
            )
            .addBooleanOption(x => x
                .setName("view")
                .setNameLocalizations({
                    "pt-BR": "ver",
                    "es-ES": "ver",
                    "de": "ansehen",
                    "fr": "voir",
                    // "ar": "عرض"
                })
                .setDescription("View how many Special Deems you have left")
                .setDescriptionLocalizations({
                    "pt-BR": "Veja quantos Deems Especiais você ainda tem",
                    "es-ES": "Ver cuántos Deems Especiales te quedan",
                    "de": "Sieh dir an, wie viele spezielle Deems du noch hast",
                    "fr": "Voir combien de Deems spéciaux il vous reste",
                    // "ar": "عرض عدد Deems الخاصة المتبقية لديك"
                })
            )
            .addBooleanOption(x => x
                .setName("use")
                .setNameLocalizations({
                    "pt-BR": "usar",
                    "es-ES": "usar",
                    "de": "benutzen",
                    "fr": "utiliser",
                    // "ar": "استخدام"
                })
                .setDescription("Use the deems you have to randomly get a special Pokemon")
                .setDescriptionLocalizations({
                    "pt-BR": "Use os deems que você tem para obter aleatoriamente um Pokémon especial",
                    "es-ES": "Usa los deems que tienes para obtener al azar un Pokémon especial",
                    "de": "Benutze die Deems, die du hast, um zufällig ein besonderes Pokémon zu erhalten",
                    "fr": "Utilisez les deems que vous avez pour obtenir au hasard un Pokémon spécial",
                    // "ar": "استخدم الـ deems التي لديك للحصول على بوكيمون خاص بشكل عشوائي"
                })
            )
        )
        .addSubcommand(x => x
            .setName("help")
            .setNameLocalizations({
                "pt-BR": "ajuda",
                "es-ES": "ayuda",
                "de": "hilfe",
                "fr": "aide",
                // "ar": "مساعدة"
            })
            .setDescription("Check out how to use the Market Command and apparently abandon what you gained trust of!")
            .setDescriptionLocalizations({
                "pt-BR": "Confira como usar o Comando do Mercado e aparentemente abandonar aquilo em que você conquistou a confiança!",
                "es-ES": "¡Echa un vistazo a cómo usar el Comando del Mercado y aparentemente abandonar aquello en lo que ganaste confianza!",
                "de": "Schau dir an, wie du den Markt-Befehl benutzt und anscheinend das aufgibst, wessen Vertrauen du gewonnen hast!",
                "fr": "Découvrez comment utiliser la commande Marché et abandonnez apparemment ce dont vous avez gagné la confiance!",
                // "ar": "تحقق من كيفية استخدام أمر السوق والتخلي على ما يبدو عما اكتسبت ثقته!"
            })
        ),
    async execute(msg) {

        // Redirect to Help if called
        if (msg.options.getSubcommand() == "help")
            return msg.options._hoistedOptions.push({ name: "command_name", type: 3, value: "redeem" }),
                msg.client.commands.get("help")(msg);

        // Fetch User
        const player = new Player({ id: msg.user.id });

        await player.fetch(msg.client.postgres);

        if (!player.started)
            return await msg.reply("You have not started your adventure yet...");

        // Fetch Redeems
        let { bal, redeem, special_deem } = await player.fetchIncome(msg.client.postgres);

        // Check SubCommand
        const SubCommand = msg.options.getSubcommand();

        // IF SubCommand was used
        if (SubCommand) {

            switch (SubCommand) {
                // IF user plans to use command for themself
                case "self": {
                    if (!redeem)
                        return await msg.reply("Sorry, you do not have enough credits for that...");

                    // Assign Constants
                    const credits = msg.options.getBoolean('credits'),
                        spawn = msg.options.getString('spawn'),
                        getPokemon = msg.options.getString("get-pokemon");

                    // IF user wants Credits
                    if (credits)
                        return await player.save(msg.client.postgres, { redeem: --redeem, bal: bal + 1e4 }),
                            await msg.reply("10K pokedits were deposited to your account");

                    // IF user decides to Spawn or getPokemon
                    if (spawn || getPokemon) {

                        // Check if Pokemon selected is valid
                        const selectedPokemon = spawn || getPokemon;

                        const pokedex = new Pokedex({});

                        await pokedex.searchForID(selectedPokemon);

                        // Reject if Pokemon not found
                        if (!pokedex.pokedex.id)
                            return await msg.reply("That Pokemon does not exist");

                        // Fetch Rarity
                        // const rarity = await pokedex.checkRarity();

                        // IF nonSpawn, reject
                        if (pokedex.pokedex.is_custom || pokedex.pokedex.is_nonspawnable)
                            return await msg.reply("That Pokemon cannot be given or spawned.");

                        if (spawn) {
                            // Init Spawn if not existent
                            if (!msg.channel.spawn) msg.channel.spawn = {};
                            // Initializing New Pokemon
                            msg.channel.spawn.pokemon = pokedex;
                            // Spawn Pokemon Execution
                            await msg.channel.spawn.pokemon.SpawnFriendlyV2(true);
                            // Send Message
                            await msg.channel.spawn.pokemon.spawnToChannel(msg.channel);
                            // Reduce Redeem
                            await player.save(msg.client.postgres, { redeem: --player.redeem });
                            // Reply
                            return await msg.reply({ flags: MessageFlags.Ephemeral, content: "Pokemon Spawned!" });
                        } else {
                            // Ready Spawn Type Data
                            await pokedex.SpawnFriendlyV2(true);
                            // Attach User
                            pokedex.user_id = BigInt(msg.user.id);

                            // Increment readied IDX
                            const [idx] = await msg.client.postgres`SELECT idx FROM pokemon WHERE user_id = ${msg.user.id} ORDER BY idx desc`;
                            pokedex.idx = idx.idx || 1;

                            // Save to DB
                            await pokedex.save(msg.client.postgres);

                            // Reduce Redeem
                            await player.save(msg.client.postgres, { redeem: --player.redeem });

                            // Send Message
                            return await msg.reply(`<@${msg.user.id}> successfully recieved the ${capitalize(pokedex.pokemon)} (${pokedex.level}).`);
                        }
                    }
                    return
                }
                // IF user plants to use command for someone else
                case "gift": {

                    if (!redeem)
                        return await msg.reply("Sorry, you do not have enough credits for that...");

                    const redeems = msg.options.getUser("redeem"),
                        credits = msg.options.getUser('credits');

                    if (redeems || credits) {

                        const user = redeems || credits;

                        const selectedPlayer = new Player({ id: user.id });

                        await selectedPlayer.fetch(msg.client.postgres);

                        if (!selectedPlayer.started)
                            return await msg.reply("User has not started their journey...");

                        if (redeems)
                            return await msg.client.postgres.begin(sql => [sql`UPDATE users SET redeem = redeem - 1 WHERE id = ${player.id};`, sql`UPDATE users SET redeem = redeem + 1 WHERE id = ${selectedPlayer.id};`]),
                                await msg.reply("Redeem was gifted to the user you specified... Good job! :O");

                        if (credits)
                            return await msg.client.postgres.begin(sql => [sql`UPDATE users SET redeem = redeem - 1 WHERE id = ${player.id};`, sql`UPDATE users SET bal = bal + 10000 WHERE id = ${selectedPlayer.id};`]),
                                await msg.reply("Credits were gifted to the user you specified... Whoever they may be, they must be happy to have you as a friend.");
                    }
                }
                case "event": {

                    if (msg.options.getBoolean('view'))
                        return msg.reply({
                            embeds: [{
                                title: `❄️ Snowy Event ❄️ ${special_deem || 0} ❄️`,
                                description: "Welcome to Pokedi's Christmas and Snow Event! Come around and enjoy the warm fireplace and some hot coco. We got plenty around to share!\n\nFor every Special Deem, have a chance to win a Wintery Pokemon, and if your luck's really got a thing for you, get a legendary Snow-Event Pokemon!",
                                color: 0x005284,
                                fields: [{
                                    name: "-----",
                                    value: `Special Prizes await`
                                }],
                                image: {
                                    url: "https://cdn.discordapp.com/attachments/688616004758011993/1187838541707874394/image.png"
                                }
                            }]
                        });

                    if (msg.options.getBoolean('buy')) {
                        // Amount of Special Deems
                        const amount = msg.options.getInteger("amount") || 1;

                        if (redeem < 2)
                            return msg.reply("You require 2 deems to buy a Snowflake!");

                        if (amount * 2 > redeem)
                            return msg.reply("You do not have enough redeems to buy that many snowflakes");

                        await msg.client.postgres`UPDATE users SET special_deem = special_deem + ${amount}, redeem = redeem - ${amount * 2} WHERE id = ${msg.user.id}`;

                        return await msg.reply("❄️ A beautiful snowflake fell into your bag ❄️");
                    }

                    if (msg.options.getBoolean("use")) {

                        if (special_deem < 1)
                            return await msg.reply("You haven't acquired a Snowflake yet!");

                        // Access JSON
                        const { default: event } = await import("../../Utilities/Data/events.json", { type: "json" } );

                        // Event Name
                        const eventName = 'snow-event-2023'

                        // Selected Pokemon
                        const selectedPokemon = Chance().weighted(event[eventName].pokemon, event[eventName].pokemon.map(x => x.chance));

                        // Ready Pokedex
                        const pokedex = new Pokedex({});

                        await pokedex.fetchByID(selectedPokemon.id, true);

                        // Reject if Pokemon not found
                        if (!pokedex.pokedex.id)
                            return await msg.reply("That Pokemon does not exist");

                        // Ready Spawn Type Data
                        await pokedex.SpawnFriendlyV2(true);

                        // Attach User
                        pokedex.user_id = BigInt(msg.user.id);

                        // Increment readied IDX
                        const [idx] = await msg.client.postgres`SELECT idx FROM pokemon WHERE user_id = ${msg.user.id} ORDER BY idx desc`;

                        pokedex.idx = idx.idx || 1;

                        // Save to DB
                        await pokedex.save(msg.client.postgres);

                        // Reduce Redeem
                        await msg.client.postgres`UPDATE users SET special_deem = special_deem - 1 WHERE id = ${msg.user.id}`;

                        // Send Message
                        return await msg.reply(`As a Snowflake melts, <@${msg.user.id}> successfully recieves a ${capitalize(pokedex.pokemon, true)} (${pokedex.level}).`);
                    }
                }
            }
        }

        return msg.reply({
            embeds: [{
                color: 44678,
                title: `Your Redeems: ${redeem} 💸`,
                description: "Redeems are a paid virtual currency, used for buying Pokémon, spawning them, or sending them as a gift to an existing user. Even the same can be done for 10K Credits.",
                fields: [{
                    name: `</redeem:${msg.commandId}> self spawn:pokemon`,
                    value: "Use this to spawn the Pokémon of your choice!"
                }, {
                    name: `</redeem:${msg.commandId}> self get-pokemon:<pokemon name>`,
                    value: "Use this to directly get a Pokemon in your inventory"
                }, {
                    name: `</redeem:${msg.commandId}> self credits`,
                    value: "Use this to get 10K credits"
                }, {
                    name: `</redeem:${msg.commandId}> gift [credits/redeem]:<user>`,
                    value: "Use this to gift 10K credits or a redeem to a user"
                }]
            }]
        });

    }
}
