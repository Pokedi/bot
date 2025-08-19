import { AttachmentBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import Player from "../../Classes/player.js";
import Pokemon from "../../Classes/pokemon.js";
import { Chance } from "chance";
import capitalize from "../../Utilities/Misc/capitalize.js";
import Pokedex from "../../Classes/pokedex.js";
import pokemondb from "../Database/pokedb.js";

// Backgrounds
import backgrounds from "../../Utilities/Data/backgrounds.json" with {type: "json"};

// Forms
import forms from "../../Utilities/Data/PokemonDB/pokemon_forms.json" with {type: "json"};
import getDominantColor from "../../Utilities/Misc/getDominantColor.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName("shop")
        .setNameLocalizations({
            "es-ES": "tienda",
            "pt-BR": "loja",
            "de": "laden",
            "fr": "boutique",
            // "ar": "متجر"
        })
        .setDescription("The place where dreams can come true, I think")
        .setDescriptionLocalizations({
            "pt-BR": "O lugar onde os sonhos podem se tornar realidade, eu acho",
            "es-ES": "El lugar donde los sueños pueden hacerse realidad, creo",
            "de": "Der Ort, an dem Träume wahr werden können, denke ich",
            "fr": "L'endroit où les rêves peuvent devenir réalité, je pense",
            // "ar": "المكان الذي يمكن أن تتحقق فيه الأحلام ، على ما أعتقد"
        })
        .addSubcommand(y => y
            .setName("xp")
            .setNameLocalizations({
                "pt-BR": "xp",
                "es-ES": "xp",
                "de": "ep",
                "fr": "xp",
                // "ar": "نقاط-الخبرة"
            })
            .setDescription("XP Boosters & Rare Candy")
            .setDescriptionLocalizations({
                "pt-BR": "Boosters de XP e Doce Raro",
                "es-ES": "Potenciadores de XP y Caramelo Raro",
                "de": "EP-Booster & Sonderbonbon",
                "fr": "Boosters d'XP et Super Bonbon",
                // "ar": "معززات نقاط الخبرة والحلوى النادرة"
            })
            .addIntegerOption(z => z
                .setName("buy")
                .setNameLocalizations({
                    "pt-BR": "comprar",
                    "es-ES": "comprar",
                    "de": "kaufen",
                    "fr": "acheter",
                    // "ar": "شراء"
                })
                .setDescription("Buy a booster or EXP")
                .setDescriptionLocalizations({
                    "pt-BR": "Compre um booster ou EXP",
                    "es-ES": "Compra un potenciador o EXP",
                    "de": "Kaufe einen Booster oder EP",
                    "fr": "Achetez un booster ou de l'XP",
                    // "ar": "شراء معزز أو نقاط خبرة"
                })
                .addChoices({
                    name: "Rare Candy (50c per candy)",
                    value: 4
                }, {
                    name: "EXP Boost Type-1 (x20) (100c) (2 hours)",
                    value: 1
                }, {
                    name: "EXP Boost Type-2 (x40) (500c) (10 minutes)",
                    value: 2
                }, {
                    name: "EXP Boost Type-3 (x60) (2000c) (5 minutes)",
                    value: 3
                }).setRequired(true)
            )
            .addIntegerOption(z => z
                .setName("amount")
                .setNameLocalizations({
                    "pt-BR": "quantidade",
                    "es-ES": "cantidad",
                    "de": "menge",
                    "fr": "montant",
                    // "ar": "كمية"
                })
                .setDescription("Amount you wish to buy")
                .setDescriptionLocalizations({
                    "pt-BR": "Quantidade que você deseja comprar",
                    "es-ES": "Cantidad que deseas comprar",
                    "de": "Menge, die du kaufen möchtest",
                    "fr": "Montant que vous souhaitez acheter",
                    // "ar": "الكمية التي ترغب في شرائها"
                })
                .setMinValue(1)
            )
        )
        .addSubcommand(y => y
            .setName("stones")
            .setNameLocalizations({
                "pt-BR": "pedras",
                "es-ES": "piedras",
                "de": "steine",
                "fr": "pierres",
                // "ar": "أحجار"
            })
            .setDescription("Evolution Stones used for evolving your Pokemon")
            .setDescriptionLocalizations({
                "pt-BR": "Pedras de Evolução usadas para evoluir seu Pokémon",
                "es-ES": "Piedras de Evolución utilizadas para evolucionar a tu Pokémon",
                "de": "Entwicklungssteine, die zur Entwicklung deines Pokémon verwendet werden",
                "fr": "Pierres d'Évolution utilisées pour faire évoluer votre Pokémon",
                // "ar": "أحجار التطور المستخدمة لتطوير بوكيمونك"
            })
            .addIntegerOption(z => z
                .setName("stone")
                .setNameLocalizations({
                    "pt-BR": "pedra",
                    "es-ES": "piedra",
                    "de": "stein",
                    "fr": "pierre",
                    // "ar": "حجر"
                })
                .setDescription("Give a stone to your Pokemon to evolve from")
                .setDescriptionLocalizations({
                    "pt-BR": "Dê uma pedra ao seu Pokémon para evoluir",
                    "es-ES": "Dale una piedra a tu Pokémon para que evolucione",
                    "de": "Gib deinem Pokémon einen Stein, um sich zu entwickeln",
                    "fr": "Donnez une pierre à votre Pokémon pour le faire évoluer",
                    // "ar": "أعط حجرا لبوكيمونك ليتطور"
                })
                .setAutocomplete(true)
                .setRequired(true)
            ).addIntegerOption(y => y
                .setName("id")
                .setNameLocalizations({
                    "pt-BR": "id",
                    "es-ES": "id",
                    "de": "id",
                    "fr": "id",
                    // "ar": "المعرف"
                })
                .setDescription("ID of the pokemon if provided")
                .setDescriptionLocalizations({
                    "pt-BR": "ID do pokemon se fornecido",
                    "es-ES": "ID del pokemon si se proporciona",
                    "de": "ID des Pokémon, falls angegeben",
                    "fr": "ID du pokémon si fourni",
                    // "ar": "معرف البوكيمون إذا تم توفيره"
                })
                .setMinValue(1)
            )
        )
        .addSubcommand(y => y
            .setName("nature")
            .setNameLocalizations({
                "pt-BR": "natureza",
                "es-ES": "naturaleza",
                "de": "wesen",
                "fr": "nature",
                // "ar": "طبيعة"
            })
            .setDescription("Turn your shy child into a smile child")
            .setDescriptionLocalizations({
                "pt-BR": "Transforme sua criança tímida em uma criança sorridente",
                "es-ES": "Convierte a tu niño tímido en un niño sonriente",
                "de": "Verwandle dein schüchternes Kind in ein lächelndes Kind",
                "fr": "Transformez votre enfant timide en un enfant souriant",
                // "ar": "حول طفلك الخجول إلى طفل مبتسم"
            })
            .addStringOption(z => z
                .setName("nature")
                .setNameLocalizations({
                    "pt-BR": "natureza",
                    "es-ES": "naturaleza",
                    "de": "wesen",
                    "fr": "nature",
                    // "ar": "طبيعة"
                })
                .setDescription("Select the nature you wish to give your Pokemon. 500c each.")
                .setDescriptionLocalizations({
                    "pt-BR": "Selecione a natureza que você deseja dar ao seu Pokémon. 500c cada.",
                    "es-ES": "Selecciona la naturaleza que deseas darle a tu Pokémon. 500c cada una.",
                    "de": "Wähle das Wesen aus, das du deinem Pokémon geben möchtest. 500c pro Stück.",
                    "fr": "Sélectionnez la nature que vous souhaitez donner à votre Pokémon. 500c chacun.",
                    // "ar": "اختر الطبيعة التي ترغب في إعطائها لبوكيمونك. 500c لكل منها."
                })
                .addChoices(
                    {
                        name: 'Hardy',
                        value: 'hardy'
                    },
                    {
                        name: 'Lonely',
                        value: 'lonely'
                    },
                    {
                        name: 'Brave',
                        value: 'brave'
                    },
                    {
                        name: 'Adamant',
                        value: 'adamant'
                    },
                    {
                        name: 'Naughty',
                        value: 'naughty'
                    },
                    {
                        name: 'Bold',
                        value: 'bold'
                    },
                    {
                        name: 'Docile',
                        value: 'docile'
                    },
                    {
                        name: 'Relaxed',
                        value: 'relaxed'
                    },
                    {
                        name: 'Impish',
                        value: 'impish'
                    },
                    {
                        name: 'Lax',
                        value: 'lax'
                    },
                    {
                        name: 'Timid',
                        value: 'timid'
                    },
                    {
                        name: 'Hasty',
                        value: 'hasty'
                    },
                    {
                        name: 'Serious',
                        value: 'serious'
                    },
                    {
                        name: 'Jolly',
                        value: 'jolly'
                    },
                    {
                        name: 'Naive',
                        value: 'naive'
                    },
                    {
                        name: 'Modest',
                        value: 'modest'
                    },
                    {
                        name: 'Mild',
                        value: 'mild'
                    },
                    {
                        name: 'Quiet',
                        value: 'quiet'
                    },
                    {
                        name: 'Bashful',
                        value: 'bashful'
                    },
                    {
                        name: 'Rash',
                        value: 'rash'
                    },
                    {
                        name: 'Calm',
                        value: 'calm'
                    },
                    {
                        name: 'Gentle',
                        value: 'gentle'
                    },
                    {
                        name: 'Sassy',
                        value: 'sassy'
                    },
                    {
                        name: 'Careful',
                        value: 'careful'
                    },
                    {
                        name: 'Quirky',
                        value: 'quirky'
                    }
                ).setRequired(true)
            ).addIntegerOption(y => y
                .setName("id")
                .setNameLocalizations({
                    "pt-BR": "id",
                    "es-ES": "id",
                    "de": "id",
                    "fr": "id",
                    // "ar": "المعرف"
                })
                .setDescription("ID of the pokemon if provided")
                .setDescriptionLocalizations({
                    "pt-BR": "ID do pokemon se fornecido",
                    "es-ES": "ID del pokemon si se proporciona",
                    "de": "ID des Pokémon, falls angegeben",
                    "fr": "ID du pokémon si fourni",
                    // "ar": "معرف البوكيمون إذا تم توفيره"
                })
                .setMinValue(1)
            )
        )
        .addSubcommand(y => y
            .setName("evolve")
            .setNameLocalizations({
                "pt-BR": "evoluir",
                "es-ES": "evolucionar",
                "de": "entwickeln",
                "fr": "évoluer",
                // "ar": "تطور"
            })
            .setDescription("Evolutions || Items & Plates, ya know?")
            .setDescriptionLocalizations({
                "pt-BR": "Evoluções || Itens e Placas, sabe?",
                "es-ES": "Evoluciones || Objetos y Placas, ¿sabes?",
                "de": "Entwicklungen || Items & Platten, weißt du?",
                "fr": "Évolutions || Objets et Plaques, tu sais?",
                // "ar": "التطورات || العناصر واللوحات ، كما تعلم؟"
            })
            .addIntegerOption(x => x.setName('item-name').setDescription("Name of the Form, Item, or State.").setAutocomplete(true)
                .setNameLocalizations({
                    "pt-BR": "nome-item",
                    "es-ES": "nombre-articulo",
                    "de": "gegenstand-name",
                    "fr": "nom-objet",
                    // "ar": "اسم-العنصر"
                })
                .setDescriptionLocalizations({
                    "pt-BR": "Nome da Forma, Item ou Estado.",
                    "es-ES": "Nombre de la Forma, Objeto o Estado.",
                    "de": "Name der Form, des Gegenstands oder des Zustands.",
                    "fr": "Nom de la Forme, de l'Objet ou de l'État.",
                    // "ar": "اسم النموذج أو العنصر أو الحالة."
                }))
            .addIntegerOption(y => y
                .setName("id")
                .setNameLocalizations({
                    "pt-BR": "id",
                    "es-ES": "id",
                    "de": "id",
                    "fr": "id",
                    // "ar": "المعرف"
                })
                .setDescription("ID of the pokemon if provided")
                .setDescriptionLocalizations({
                    "pt-BR": "ID do pokemon se fornecido",
                    "es-ES": "ID del pokemon si se proporciona",
                    "de": "ID des Pokémon, falls angegeben",
                    "fr": "ID du pokémon si fourni",
                    // "ar": "معرف البوكيمون إذا تم توفيره"
                })
                .setMinValue(1)
            )
        )
        .addSubcommand(y => y
            .setName("forms")
            .setNameLocalizations({
                "pt-BR": "formas",
                "es-ES": "formas",
                "de": "formen",
                "fr": "formes",
                // "ar": "نماذج"
            })
            .setDescription("Forms & Mega Evolutions || Items & Plates, ya know?")
            .setDescriptionLocalizations({
                "pt-BR": "Formas e Mega Evoluções || Itens e Placas, sabe?",
                "es-ES": "Formas y Mega Evoluciones || Objetos y Placas, ¿sabes?",
                "de": "Formen & Mega-Entwicklungen || Items & Platten, weißt du?",
                "fr": "Formes et Méga-Évolutions || Objets et Plaques, tu sais?",
                // "ar": "النماذج والتطورات الضخمة || العناصر واللوحات ، كما تعلم؟"
            })
            .addBooleanOption(x => x.setName("listing").setDescription("Check available form options")
                .setNameLocalizations({
                    "pt-BR": "listagem",
                    "es-ES": "listado",
                    "de": "auflistung",
                    "fr": "liste",
                    // "ar": "قائمة"
                })
                .setDescriptionLocalizations({
                    "pt-BR": "Verifique as opções de formulário disponíveis",
                    "es-ES": "Consultar las opciones de formulario disponibles",
                    "de": "Verfügbare Formularoptionen prüfen",
                    "fr": "Vérifier les options de formulaire disponibles",
                    // "ar": "تحقق من خيارات النموذج المتاحة"
                }))
            .addStringOption(x => x.setName('item-name').setDescription("Name of the Form, Item, or State.")
                .setNameLocalizations({
                    "pt-BR": "nome-item",
                    "es-ES": "nombre-articulo",
                    "de": "gegenstand-name",
                    "fr": "nom-objet",
                    // "ar": "اسم-العنصر"
                })
                .setDescriptionLocalizations({
                    "pt-BR": "Nome da Forma, Item ou Estado.",
                    "es-ES": "Nombre de la Forma, Objeto o Estado.",
                    "de": "Name der Form, des Gegenstands oder des Zustands.",
                    "fr": "Nom de la Forme, de l'Objet ou de l'État.",
                    // "ar": "اسم النموذج أو العنصر أو الحالة."
                }))
        )
        .addSubcommand(y => y
            .setName("profile")
            .setNameLocalizations({
                "pt-BR": "perfil",
                "es-ES": "perfil",
                "de": "profil",
                "fr": "profil",
                // "ar": "الملف-الشخصي"
            })
            .setDescription("Check available Trainer Profiles or Backgrounds to show off to your friends!")
            .setDescriptionLocalizations({
                "pt-BR": "Confira os Perfis de Treinador ou Planos de Fundo disponíveis para mostrar aos seus amigos!",
                "es-ES": "¡Consulta los Perfiles de Entrenador o Fondos disponibles para presumir ante tus amigos!",
                "de": "Überprüfe verfügbare Trainerprofile oder Hintergründe, um sie deinen Freunden zu zeigen!",
                "fr": "Consultez les profils d'entraîneur ou les arrière-plans disponibles pour les montrer à vos amis!",
                // "ar": "تحقق من ملفات تعريف المدربين أو الخلفيات المتاحة للتباهي بها أمام أصدقائك!"
            })
            .addBooleanOption(z => z.setName("background-listing").setDescription("Check out available backgrounds")
                .setNameLocalizations({
                    "pt-BR": "listagem-fundo",
                    "es-ES": "listado-fondo",
                    "de": "hintergrund-auflistung",
                    "fr": "liste-arrière-plan",
                    // "ar": "قائمة-الخلفية"
                })
                .setDescriptionLocalizations({
                    "pt-BR": "Confira os planos de fundo disponíveis",
                    "es-ES": "Consultar los fondos disponibles",
                    "de": "Verfügbare Hintergründe ansehen",
                    "fr": "Consultez les arrière-plans disponibles",
                    // "ar": "تحقق من الخلفيات المتاحة"
                }))
            .addIntegerOption(z => z.setName("background-id").setDescription("Select the Background you wish to buy")
                .setNameLocalizations({
                    "pt-BR": "id-fundo",
                    "es-ES": "id-fondo",
                    "de": "hintergrund-id",
                    "fr": "id-arrière-plan",
                    // "ar": "معرف-الخلفية"
                })
                .setDescriptionLocalizations({
                    "pt-BR": "Selecione o Plano de Fundo que deseja comprar",
                    "es-ES": "Selecciona el Fondo que deseas comprar",
                    "de": "Wähle den Hintergrund aus, den du kaufen möchtest",
                    "fr": "Sélectionnez l'arrière-plan que vous souhaitez acheter",
                    // "ar": "حدد الخلفية التي ترغب في شرائها"
                }))
            .addBooleanOption(z => z.setName("preview").setDescription("Preview the Background!")
                .setNameLocalizations({
                    "pt-BR": "visualizar",
                    "es-ES": "vista-previa",
                    "de": "vorschau",
                    "fr": "aperçu",
                    // "ar": "معاينة"
                })
                .setDescriptionLocalizations({
                    "pt-BR": "Visualize o Plano de Fundo!",
                    "es-ES": "¡Vista previa del Fondo!",
                    "de": "Vorschau des Hintergrunds!",
                    "fr": "Aperçu de l'arrière-plan!",
                    // "ar": "معاينة الخلفية!"
                }))
        ),
    // .addSubcommand(y => y
    //     .setName("misc")
    //     .setDescription("Forms, my tears, and so much more!")
    // )
    // .addSubcommand(y => y
    //     .setName("menu")
    //     .setDescription("Shows you a Menu you might like")
    // )
    async execute(msg) {

        // Redirect to Help if Called
        if (msg.options.getSubcommand() == "help")
            return msg.options._hoistedOptions.push({ name: "command_name", type: 3, value: "market" }),
                msg.client.commands.get("help")(msg);

        const player = new Player(msg.user);
        await player.fetch(msg.client.postgres);

        if (!player.started) return msg.reply("you have not started your adventure. Please try using /start");

        // Is Dueling?
        if (await player.isInDuel(msg.client.redis))
            return await msg.followUp(`You are currently in a duel right now...`);

        // Is Trading
        if (await player.isTrading(msg.client.redis))
            return await msg.followUp(`You are currently in a trade right now...`);

        const subCommand = msg.options.getSubcommand();

        switch (subCommand) {
            case "xp": {
                const amount = msg.options.getInteger("amount") || 1;
                if (msg.options.getInteger("buy") == 4) {
                    if (player.bal < 200 * (amount)) return msg.reply("You do not have enough money for that.");

                    await player.save(msg.client.postgres, {
                        bal: player.bal - 50 * (amount)
                    });

                    const details = await player.pokemonLevelUp(msg.client.postgres, msg, amount);

                    return msg.reply({ flags: MessageFlags.Ephemeral, content: "Pokemon Leveled up! ✅" + (details.evolvedPokemon ? " Seems like an evolution has taken place as well. Check it out!" : "") });
                }
            }
                break;
            case "nature": {
                if (player.bal < 500) return msg.reply("You need at least 500 pokedits for that!");

                const id = msg.options.getInteger("id");

                if (!id && !player.selected[0]) return msg.reply("No Pokemon selected...");

                let selectedPokemon = new Pokemon(id ? { idx: id, user_id: msg.user.id } : { id: player.selected[0] });

                await selectedPokemon.fetchPokemonByIDX(msg.client.postgres);

                if (!selectedPokemon.pokemon) return msg.reply("Pokemon does not exist...");

                const selectedNature = msg.options.getString("nature");

                selectedPokemon.save(msg.client.postgres, { nature: selectedNature })

                await player.save(msg.client.postgres, {
                    bal: player.bal - 500
                });

                return msg.reply(`Your ${capitalize(selectedPokemon.pokemon)} was given a ${selectedNature} mint. ${Chance().pickone(
                    [
                        "It also ate 500 credits from your wallet.",
                        "It snuck some snack money from you.",
                        "It also kidnapped some moneyz from you.",
                        "You got more broke than you already are.",
                        "For some reason you have less money than before... Why?",
                        "Anthony charged you 500 pokedits for taxes."
                    ]
                )}`);
            }

            case "stones":
            case "evolve":
                {
                    const product = msg.options.getInteger("stone") || msg.options.getInteger("item-name");

                    const id = msg.options.getInteger("id");

                    const selectedID = id ? { idx: id, user_id: msg.user.id } : { id: player.selected?.[0] };

                    if (!selectedID.id && !selectedID.idx)
                        return msg.reply("No Pokemon selected");

                    let selectedPokemon = new Pokedex(id ? { idx: id, user_id: msg.user.id } : { id: player.selected[0] });

                    const evolution = await selectedPokemon.fetchEvolutionByID(product);

                    if (!evolution || !evolution._id || !evolution.pre_id)
                        return msg.reply("Evolution not found");

                    const [productData] = await pokemondb`SELECT cost, name FROM pokemon_v2_item WHERE id = ${evolution.itemid} LIMIT 1`;

                    if (!productData)
                        return msg.reply("Product not found.");

                    const [possibleOverride] = await msg.client.postgres`SELECT id, cost FROM product WHERE id = ${evolution.itemid}`;

                    const cost = possibleOverride?.cost || productData.cost;

                    if (player.bal < cost) return msg.reply(`you need at least ${cost} pokedits for that.`);

                    await selectedPokemon.fetchPokemonByIDX(msg.client.postgres, "id, pokemon, gender");

                    if (!selectedPokemon.pokemon) return msg.reply("Pokemon does not exist...");

                    if (evolution.gender_id != null && evolution.gender_id != selectedPokemon.gender)
                        return msg.reply("Gender Confliction met, cannot proceed.");

                    if (selectedPokemon.pokemon != evolution.pre_id)
                        return msg.reply("Pokemon do not match. Nice try.");

                    await selectedPokemon.save(msg.client.postgres, { pokemon: evolution._id });

                    await player.save(msg.client.postgres, {
                        bal: player.bal - (cost || 0)
                    });

                    return msg.reply(`Your ${capitalize(selectedPokemon.pokemon, true)} was given a ${capitalize(productData.name, true)}. ${Chance().pickone(
                        [
                            "It posed like Sailor Moon and turned into a " + capitalize(evolution._id, true),
                            "Power Rangers Pokemon Fury! Go! I summon you, " + capitalize(evolution._id, true),
                            "Wow, puberty hits harder these days.",
                            "I don't know if it's the meds but something's different about them.",
                            "My sweet child has grown up so fast. Give grandpa a kiss."
                        ]
                    )}`);

                }

            case "profile": {

                const command = msg.options._hoistedOptions[0]?.name;

                switch (command) {
                    default:
                    case "background-listing":
                        return msg.reply({
                            embeds: [{
                                title: "Available Backgrounds",
                                description: "Buy them with \`/shop profile background-id:<ID>\`",
                                fields: Object.entries(backgrounds).map(([y, x]) => ({ name: x.name + " #" + y, value: "**Cost**: " + x.cost + " 💸" + (x.artist ? "\nCredits to " + x.artist : ""), inline: true }))
                            }]
                        });

                    case "background-id": {

                        const id = msg.options.getInteger("background-id");

                        const preview = msg.options.getBoolean("preview");

                        if (!id || !backgrounds[id] || !preview && backgrounds[id].forbidden)
                            return msg.reply("Invalid Background selected");

                        if (preview) {
                            const file = new AttachmentBuilder(`../pokediAssets/profile/backgrounds/${id}.png`);
                            return await msg.reply({
                                embeds: [{
                                    color: await getDominantColor(`../pokediAssets/profile/backgrounds/${id}.png`, true),
                                    image: {
                                        url: `attachment://${id}.png`
                                    }
                                }], files: [file]
                            });
                        }

                        const { cost, name } = backgrounds[id];

                        if (player.bal < cost)
                            return await msg.reply("Insufficient Balance");

                        await msg.client.postgres`UPDATE users SET background = ${id}, bal = bal - ${cost} WHERE id = ${msg.user.id}`;

                        return await msg.reply(`You have successfully bought the ${name} Background! Show it off to your friends.`);
                    }

                }
            }

            default:
            case "menu": {

                return msg.reply("Still under construction");
            }


            case "forms": {

                if (msg.options.getBoolean("listing")) {
                    return await msg.reply({
                        embeds: [{
                            title: "Available Pokemon",
                            description: "The following are possible Form Transformations available.",
                            color: 0x23204,
                            fields: [{
                                name: "Deoxys (1000c)",
                                value: `- Deoxys Normal: \`Average Meteorite\`\n- Deoxys Speed: \`Slippery Meteorite\`\n- Deoxys Defense: \`Hard Meteorite\`\n- Deoxys Attack: \`Dangerous Meteorite\``,
                                inline: true
                            }, {
                                name: "Shaymin (2000c)",
                                value: "- Shaymin Grounded Forme: `Literal Dirt`\n- Shaymin Sky Forme: `Gracidea`",
                                inline: true
                            }, {
                                name: "The Duo Dogs (4000c)",
                                value: "- Zacian Crowned: `Rusty Sword`\n- Zamazenta Crowned: `Rusty Shield`",
                                inline: true
                            }, {
                                name: "Arceus (500c)",
                                value: "- Arceus Change Type: `<Valid Name> Plate`",
                                inline: true
                            }, {
                                name: "Mega Arceus (10000c)",
                                value: "- Item Name: `Mega Stone`",
                                inline: true
                            }, {
                                name: "Palkia / Dialga / Giratina (Orgin) (5000c)",
                                value: "- Dialga: `Adamant Orb`\n- Palkia: `Lustrous Globe`\n- Giratina: `Griseous Core`",
                                inline: true
                            }, {
                                name: "Bisharp (3000c) (limited time)",
                                value: "- Bisharp: `Leader Crest`",
                                inline: true
                            }],
                            footer: {
                                text: "Please note that Mega Forms will be duel-only in the future to better improve the experience of users overall."
                            }
                        }]
                    })
                }

                if (!player.selected.length)
                    return msg.reply("You do not have a Pokemon selected");

                const selectedPokemon = new Pokemon({ id: player.selected[0] });

                await selectedPokemon.fetchPokemon(msg.client.postgres);

                if (!selectedPokemon.pokemon)
                    return msg.reply("Pokemon not Found, please select through the right bot");

                const pokemon = selectedPokemon.pokemon;

                if (forms[pokemon]) {

                    const item = msg.options.getString("item-name");

                    if (!item)
                        return await msg.reply("No item selected");

                    const { cost, name } = forms[pokemon][item.replace(/ /gmi, '-').toLowerCase()] || {};

                    if (!name)
                        return msg.reply("Item not found");

                    if (cost > player.bal)
                        return msg.reply("Not enough money. You need at least " + cost);

                    // Transaction
                    if (await msg.client.postgres.begin(sql => [sql`UPDATE users SET bal = bal - ${cost} WHERE id = ${player.id}`, sql`UPDATE pokemon SET pokemon = ${name} WHERE id = ${selectedPokemon.id}`])) {
                        return await msg.reply(`Your ${capitalize(pokemon, true)} changed into a ${capitalize(name, true)}`);
                    } else
                        return msg.reply("An error occurred");
                } else
                    return msg.reply("Invalid Pokemon selected");
            }
        }
    }
}
