import { ActionRowBuilder, AttachmentBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import Pokedex from "../../Classes/pokedex.js";
import userPokemonInfoModule from "../../Utilities/Pokemon/userPokemonInfoModule.js";
import builder from "../Database/QueryBuilder/queryGenerator.js";
import Pokemon from "../../Classes/pokemon.js";
import capitalize from "../../Utilities/Misc/capitalize.js";
import Player from "../../Classes/player.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName("market").setNameLocalizations({
            "es-ES": "mercado",
            "pt-BR": "mercado",
            "de": "markt",
            "fr": "marché",
            // "ar": "سوق"
        })
        .setDescription("Market where Pokémon are sold at (un)fair prices.")
        .setDescriptionLocalizations({
            "pt-BR": "Mercado onde Pokémon são vendidos a preços (in)justos.",
            "es-ES": "Mercado donde se venden Pokémon a precios (in)justos.",
            "de": "Markt, wo Pokémon zu (un)fairen Preisen verkauft werden.",
            "fr": "Marché où des Pokémon sont vendus à prix (déraisonnables)."
        })
        .addSubcommand(subcommand =>
            subcommand
                .setName("info")
                .setNameLocalizations({
                    "pt-BR": "info",
                    "es-ES": "info",
                    "de": "info",
                    "fr": "info",
                    // "ar": "معلومات"
                })
                .setDescription("Really buying a Pokémon like it's a tool? (Slavery???)")
                .setDescriptionLocalizations({
                    "pt-BR": "Vai comprar um Pokémon como se fosse ferramenta? (Escravidão???)",
                    "es-ES": "¿Comprarás un Pokémon como si fuera herramienta? (¿Esclavitud???)",
                    "de": "Kaufst du ein Pokémon wie ein Werkzeug? (Sklaverei???)",
                    "fr": "Acheter un Pokémon comme un outil ? (Esclavage???)"
                })
                .addIntegerOption(option => option
                    .setName("id")
                    .setNameLocalizations({
                        "pt-BR": "id",
                        "es-ES": "id",
                        "de": "id",
                        "fr": "id",
                        // "ar": "المعرف"
                    })
                    .setDescription("Description of the Pokémon you're after")
                    .setDescriptionLocalizations({
                        "pt-BR": "Descrição do Pokémon que procura",
                        "es-ES": "Descripción del Pokémon que buscas",
                        "de": "Beschreibung des Pokémon, das du suchst",
                        "fr": "Description du Pokémon recherché"
                    })
                    .setRequired(true)
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("buy")
                .setNameLocalizations({
                    "pt-BR": "comprar",
                    "es-ES": "comprar",
                    "de": "kaufen",
                    "fr": "acheter",
                    // "ar": "شراء"
                })
                .setDescription("Really buying a Pokémon like it's a tool? (Slavery???)")
                .setDescriptionLocalizations({
                    "pt-BR": "Vai comprar um Pokémon como se fosse ferramenta? (Escravidão???)",
                    "es-ES": "¿Comprarás un Pokémon como si fuera herramienta? (¿Esclavitud???)",
                    "de": "Kaufst du ein Pokémon wie ein Werkzeug? (Sklaverei???)",
                    "fr": "Acheter un Pokémon comme un outil ? (Esclavage???)"
                })
                .addIntegerOption(option => option
                    .setName("id")
                    .setNameLocalizations({
                        "pt-BR": "id",
                        "es-ES": "id",
                        "de": "id",
                        "fr": "id",
                        // "ar": "المعرف"
                    })
                    .setDescription("Description of the Pokémon you're after")
                    .setDescriptionLocalizations({
                        "pt-BR": "Descrição do Pokémon que procura",
                        "es-ES": "Descripción del Pokémon que buscas",
                        "de": "Beschreibung des Pokémon, das du suchst",
                        "fr": "Description du Pokémon recherché"
                    })
                    .setRequired(true)
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("sell")
                .setNameLocalizations({
                    "pt-BR": "vender",
                    "es-ES": "vender",
                    "de": "verkaufen",
                    "fr": "vendre",
                    // "ar": "بيع"
                })
                .setDescription("Put your innocent Pokémon up for sale (sick)")
                .setDescriptionLocalizations({
                    "pt-BR": "Coloque seu Pokémon inocente à venda (doente)",
                    "es-ES": "Pon tu Pokémon inocente en venta (enfermo)",
                    "de": "Biete dein unschuldiges Pokémon an (krank)",
                    "fr": "Mettez en vente votre Pokémon innocent (malade)"
                })
                .addIntegerOption(option =>
                    option
                        .setName("id")
                        .setNameLocalizations({
                            "pt-BR": "id",
                            "es-ES": "id",
                            "de": "id",
                            "fr": "id",
                            // "ar": "المعرف"
                        })
                        .setDescription("ID of the innocent creature")
                        .setDescriptionLocalizations({
                            "pt-BR": "ID da criatura inocente",
                            "es-ES": "ID de la criatura inocente",
                            "de": "ID der unschuldigen Kreatur",
                            "fr": "ID de la créature innocente"
                        })
                        .setRequired(true))
                .addIntegerOption(option =>
                    option
                        .setName("price")
                        .setNameLocalizations({
                            "pt-BR": "preco",
                            "es-ES": "precio",
                            "de": "preis",
                            "fr": "prix",
                            // "ar": "السعر"
                        })
                        .setMinValue(200)
                        .setMaxValue(1e10)
                        .setRequired(true)
                        .setDescription("Price for the young being.")
                        .setDescriptionLocalizations({
                            "pt-BR": "Preço para o jovem ser.",
                            "es-ES": "Precio para el joven ser.",
                            "de": "Preis für das junge Wesen.",
                            "fr": "Prix pour le jeune être."
                        })
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("search")
                .setNameLocalizations({
                    "pt-BR": "pesquisar",
                    "es-ES": "buscar",
                    "de": "suchen",
                    "fr": "rechercher",
                    // "ar": "بحث"
                })
                .setDescription("Search for your dream Pokémon (why are we selling them?)")
                .setDescriptionLocalizations({
                    "pt-BR": "Procure o Pokémon dos seus sonhos (por que vendê-los?)",
                    "es-ES": "Busca el Pokémon de tus sueños (¿por qué venderlos?)",
                    "de": "Suche dein Traum-Pokémon (warum verkaufen wir sie?)",
                    "fr": "Cherchez le Pokémon de vos rêves (pourquoi les vendre ?)"
                })
                .addIntegerOption(option => option
                    .setName("page")
                    .setNameLocalizations({
                        "pt-BR": "pagina",
                        "es-ES": "pagina",
                        "de": "seite",
                        "fr": "page",
                        // "ar": "صفحة"
                    })
                    .setDescription("Pagination")
                    .setDescriptionLocalizations({
                        "pt-BR": "Paginação",
                        "es-ES": "Paginación",
                        "de": "Paginierung",
                        "fr": "Pagination",
                        // "ar": "ترقيم الصفحات"
                    }))
                .addIntegerOption(option => option
                    .setName("price_greater")
                    .setNameLocalizations({
                        "pt-BR": "preco_maior",
                        "es-ES": "precio_mayor",
                        "de": "preis_groesser",
                        "fr": "prix_superieur",
                        // "ar": "السعر_أكبر"
                    })
                    .setDescription("Price range of the Pokemon")
                    .setDescriptionLocalizations({
                        "pt-BR": "Faixa de preço do Pokémon",
                        "es-ES": "Rango de precios del Pokémon",
                        "de": "Preisspanne des Pokémon",
                        "fr": "Fourchette de prix du Pokémon",
                        // "ar": "نطاق سعر البوكيمون"
                    }))
                .addIntegerOption(option => option
                    .setName("price_lesser")
                    .setNameLocalizations({
                        "pt-BR": "preco_menor",
                        "es-ES": "precio_menor",
                        "de": "preis_kleiner",
                        "fr": "prix_inferieur",
                        // "ar": "السعر_أصغر"
                    })
                    .setDescription("Price range of the Pokemon")
                    .setDescriptionLocalizations({
                        "pt-BR": "Faixa de preço do Pokémon",
                        "es-ES": "Rango de precios del Pokémon",
                        "de": "Preisspanne des Pokémon",
                        "fr": "Fourchette de prix du Pokémon",
                        // "ar": "نطاق سعر البوكيمون"
                    }))
                .addIntegerOption(option => option
                    .setName("id")
                    .setNameLocalizations({
                        "pt-BR": "id",
                        "es-ES": "id",
                        "de": "id",
                        "fr": "id",
                        // "ar": "المعرف"
                    })
                    .setDescription("ID of the pokemon you're looking for or greater")
                    .setDescriptionLocalizations({
                        "pt-BR": "ID do pokémon que você está procurando ou maior",
                        "es-ES": "ID del pokémon que estás buscando o mayor",
                        "de": "ID des Pokémon, das du suchst oder größer",
                        "fr": "ID du pokémon que vous recherchez ou supérieur",
                        // "ar": "معرف البوكيمون الذي تبحث عنه أو أكبر"
                    }))
                .addStringOption(option => option
                    .setName("user_id")
                    .setNameLocalizations({
                        "pt-BR": "id_usuario",
                        "es-ES": "id_usuario",
                        "de": "benutzer_id",
                        "fr": "id_utilisateur",
                        // "ar": "معرف_المستخدم"
                    })
                    .setDescription("ID of the User")
                    .setDescriptionLocalizations({
                        "pt-BR": "ID do Usuário",
                        "es-ES": "ID del Usuario",
                        "de": "ID des Benutzers",
                        "fr": "ID de l'Utilisateur",
                        // "ar": "معرف المستخدم"
                    }))
                .addStringOption(option => option
                    .setName("name")
                    .setNameLocalizations({
                        "pt-BR": "nome",
                        "es-ES": "nombre",
                        "de": "name",
                        "fr": "nom",
                        // "ar": "اسم"
                    })
                    .setDescription("Name of the pokemon")
                    .setDescriptionLocalizations({
                        "pt-BR": "Nome do pokémon",
                        "es-ES": "Nombre del pokémon",
                        "de": "Name des Pokémon",
                        "fr": "Nom du pokémon",
                        // "ar": "اسم البوكيمون"
                    }))
                .addStringOption(option => option
                    .setName("nature")
                    .setNameLocalizations({
                        "pt-BR": "natureza",
                        "es-ES": "naturaleza",
                        "de": "wesen",
                        "fr": "nature",
                        // "ar": "طبيعة"
                    })
                    .addChoices({ name: 'Hardy', value: 'hardy' },
                        { name: 'Lonely', value: 'lonely' },
                        { name: 'Brave', value: 'brave' },
                        { name: 'Adamant', value: 'adamant' },
                        { name: 'Naughty', value: 'naughty' },
                        { name: 'Bold', value: 'bold' },
                        { name: 'Docile', value: 'docile' },
                        { name: 'Relaxed', value: 'relaxed' },
                        { name: 'Impish', value: 'impish' },
                        { name: 'Lax', value: 'lax' },
                        { name: 'Timid', value: 'timid' },
                        { name: 'Hasty', value: 'hasty' },
                        { name: 'Serious', value: 'serious' },
                        { name: 'Jolly', value: 'jolly' },
                        { name: 'Naive', value: 'naive' },
                        { name: 'Modest', value: 'modest' },
                        { name: 'Mild', value: 'mild' },
                        { name: 'Quiet', value: 'quiet' },
                        { name: 'Bashful', value: 'bashful' },
                        { name: 'Rash', value: 'rash' },
                        { name: 'Calm', value: 'calm' },
                        { name: 'Gentle', value: 'gentle' },
                        { name: 'Sassy', value: 'sassy' },
                        { name: 'Careful', value: 'careful' },
                        { name: 'Quirky', value: 'quirky' })
                    .setDescription("Nature of the Pokemon-equal Query")
                    .setDescriptionLocalizations({
                        "pt-BR": "Natureza da consulta igual a Pokémon",
                        "es-ES": "Naturaleza de la consulta igual a Pokémon",
                        "de": "Wesen der Pokémon-gleichen Abfrage",
                        "fr": "Nature de la requête égale à Pokémon",
                        // "ar": "طبيعة استعلام يساوي بوكيمون"
                    }))
                .addNumberOption(option => option
                    .setName("iv-greater")
                    .setNameLocalizations({
                        "pt-BR": "iv-maior",
                        "es-ES": "iv-mayor",
                        "de": "iv-groesser",
                        "fr": "iv-superieur",
                        // "ar": "iv-أكبر"
                    })
                    .setDescription("Total IV MORE than or-equal to Query")
                    .setDescriptionLocalizations({
                        "pt-BR": "IV Total MAIOR ou igual à Consulta",
                        "es-ES": "IV Total MÁS que o igual a la Consulta",
                        "de": "Gesamt-IV MEHR als oder gleich der Abfrage",
                        "fr": "IV Total PLUS que ou égal à la Requête",
                        // "ar": "إجمالي IV أكبر من أو يساوي الاستعلام"
                    }))
                .addNumberOption(option => option
                    .setName("iv-lesser")
                    .setNameLocalizations({
                        "pt-BR": "iv-menor",
                        "es-ES": "iv-menor",
                        "de": "iv-kleiner",
                        "fr": "iv-inferieur",
                        // "ar": "iv-أصغر"
                    })
                    .setDescription("Total IV LESS than or-equal to Query")
                    .setDescriptionLocalizations({
                        "pt-BR": "IV Total MENOR ou igual à Consulta",
                        "es-ES": "IV Total MENOS que o igual a la Consulta",
                        "de": "Gesamt-IV WENIGER als oder gleich der Abfrage",
                        "fr": "IV Total MOINS que ou égal à la Requête",
                        // "ar": "إجمالي IV أصغر من أو يساوي الاستعلام"
                    }))
                .addIntegerOption(option => option
                    .setName("atk-greater")
                    .setDescription("Attack MORE than or-equal to Query"))
                .addIntegerOption(option => option
                    .setName("atk-lesser")
                    .setDescription("Attack LESS than or-equal to Query"))
                .addIntegerOption(option => option
                    .setName("spatk-greater")
                    .setDescription("Special Attack MORE than or-equal to Query"))
                .addIntegerOption(option => option
                    .setName("spatk-lesser")
                    .setDescription("Special Attack LESS than or-equal to Query"))
                .addIntegerOption(option => option
                    .setName("def-greater")
                    .setDescription("Defense MORE than or-equal to Query"))
                .addIntegerOption(option => option
                    .setName("def-lesser")
                    .setDescription("Defense LESS than or-equal to Query"))
                .addIntegerOption(option => option
                    .setName("spdef-greater")
                    .setDescription("Special Defense MORE than or-equal to Query"))
                .addIntegerOption(option => option
                    .setName("spdef-lesser")
                    .setDescription("Special Defense LESS than or-equal to Query"))
                .addIntegerOption(option => option
                    .setName("spd-greater")
                    .setDescription("Speed MORE than or-equal to Query"))
                .addIntegerOption(option => option
                    .setName("spd-lesser")
                    .setDescription("Speed LESS than or-equal to Query"))
                .addIntegerOption(option => option
                    .setName("hp-greater")
                    .setDescription("Health Points MORE than or-equal to Query"))
                .addIntegerOption(option => option
                    .setName("hp-lesser")
                    .setDescription("Health Points LESS than or-equal to Query"))
                .addIntegerOption(option => option
                    .setName("level-greater")
                    .setDescription("Level MORE than or-equal to Query"))
                .addIntegerOption(option => option
                    .setName("level-lesser")
                    .setDescription("Level LESS than or-equal to Query"))
                .addBooleanOption(option => option
                    .setName("shiny")
                    .setNameLocalizations({
                        "pt-BR": "brilhante",
                        "es-ES": "variocolor",
                        "de": "schillernd",
                        "fr": "brillant",
                        // "ar": "لامع"
                    })
                    .setDescription("Check if Pokemon is a shiny")
                    .setDescriptionLocalizations({
                        "pt-BR": "Verifique se o Pokémon é brilhante",
                        "es-ES": "Comprueba si el Pokémon es variocolor",
                        "de": "Überprüfe, ob das Pokémon ein Schillerndes ist",
                        "fr": "Vérifiez si le Pokémon est brillant",
                        // "ar": "تحقق مما إذا كان البوكيمون لامعًا"
                    }))
                .addIntegerOption(option => option
                    .setName("sorting_order")
                    .setNameLocalizations({
                        "pt-BR": "ordem_classificacao",
                        "es-ES": "orden_clasificacion",
                        "de": "sortierreihenfolge",
                        "fr": "ordre_tri",
                        // "ar": "ترتيب_الفرز"
                    })
                    .setDescription("Select the Ordering of your List")
                    .setDescriptionLocalizations({
                        "pt-BR": "Selecione a Ordem da sua Lista",
                        "es-ES": "Selecciona el Orden de tu Lista",
                        "de": "Wähle die Reihenfolge deiner Liste",
                        "fr": "Sélectionnez l'Ordre de votre Liste",
                        // "ar": "حدد ترتيب قائمتك"
                    })
                    .addChoices({
                        name: "Sort by ID Ascending",
                        value: 0
                    }, {
                        name: "Sort by ID Descending",
                        value: 1
                    }, {
                        name: "Sort by IV Ascending",
                        value: 2
                    }, {
                        name: "Sort by IV Descending",
                        value: 3
                    }))
        )
        .addSubcommand(subcommand => subcommand
            .setName("help")
            .setNameLocalizations({
                "pt-BR": "ajuda",
                "es-ES": "ayuda",
                "de": "hilfe",
                "fr": "aide",
                // "ar": "مساعدة"
            })
            .setDescription("Learn how to use Market and abandon those who trusted you!")
            .setDescriptionLocalizations({
                "pt-BR": "Aprenda a usar o Mercado e abandonar quem confiou em você!",
                "es-ES": "Aprende a usar el Mercado y abandonar a quien confió en ti!",
                "de": "Lerne den Markt zu nutzen und die zu verlassen, die dir vertrauten!",
                "fr": "Apprenez à utiliser le Marché et à quitter ceux qui vous faisaient confiance!"
            })
        ),
    async execute(msg) {
        try {

            // Redirect to Help if Called
            if (msg.options.getSubcommand() == "help")
                return msg.options._hoistedOptions.push({ name: "command_name", type: 3, value: "market" }),
                    msg.client.commands.get("help")(msg);

            // Ready User [Will be used in multiple places regardless]
            const You = new Player(msg.user);

            // Check if User is in Trade
            if (await You.isTrading(msg.client.redis))
                return msg.reply("No. You're still trading my dude.");

            // Check if User is in Trade
            if (await You.isInDuel(msg.client.redis))
                return msg.reply("No. You're still dueling, bro.");

            switch (msg.options.getSubcommand()) {
                case "info": {
                    const [foundPokemon] = await msg.client.postgres`SELECT * FROM pokemon as p INNER JOIN market as m ON p.id = m.id WHERE m.id = ${msg.options.getInteger("id")}; `;

                    if (!foundPokemon) return await msg.reply("That Pokemon does not exist...");

                    const marketedPokemon = new Pokedex(foundPokemon);

                    await marketedPokemon.searchForID();

                    await marketedPokemon.getStatsV2(true);

                    const file = new AttachmentBuilder(`../pokediAssets/pokemon/${marketedPokemon.shiny ? "shiny" : "regular"}/${foundPokemon.pokemon}.png`);

                    return await msg.reply({ embeds: [userPokemonInfoModule(marketedPokemon, null, 0, true)], files: [file] });
                }
                case "search": {
                    let [id, user_id, nature, iv_greater, iv_lesser
                        , atk_greater, atk_lesser, spatk_greater, spatk_lesser, def_greater, def_lesser, spdef_greater, spdef_lesser
                        , spd_greater, spd_lesser, hp_greater, hp_lesser, level_greater, level_lesser, name, page, price_greater, price_lesser, shiny, sorting_order] = [
                            msg.options.getInteger("id")
                            , msg.options.getString("user_id")
                            , msg.options.getString("nature")
                            , msg.options.getNumber("iv-greater")
                            , msg.options.getNumber("iv-lesser")
                            , msg.options.getInteger("atk-greater")
                            , msg.options.getInteger("atk-lesser")
                            , msg.options.getInteger("spatk-greater")
                            , msg.options.getInteger("spatk-lesser")
                            , msg.options.getInteger("def-greater")
                            , msg.options.getInteger("def-lesser")
                            , msg.options.getInteger("spdef-greater")
                            , msg.options.getInteger("spdef-lesser")
                            , msg.options.getInteger("spd-greater")
                            , msg.options.getInteger("spd-lesser")
                            , msg.options.getInteger("hp-greater")
                            , msg.options.getInteger("hp-lesser")
                            , msg.options.getInteger("level-greater")
                            , msg.options.getInteger("level-lesser")
                            , msg.options.getString("name")
                            , (msg.options.getInteger("page") || 1)
                            , msg.options.getInteger("price_greater")
                            , msg.options.getInteger("price_lesser")
                            , msg.options.getBoolean("shiny")
                            , msg.options.getInteger("sorting_order")];


                    const where = { 1: 1 };

                    const greaters = { 1: 1 };

                    const lessers = { 1: 1 };

                    let orderBy = "m.id";

                    if (id)
                        where["m.id"] = id;

                    if (user_id)
                        where["p.user_id"] = user_id;

                    if (nature)
                        where["p.nature"] = nature;

                    if (shiny)
                        where["p.shiny"] = true;

                    if (price_greater)
                        greaters["m.price"] = price_greater;

                    if (price_lesser)
                        lessers["m.price"] = price_lesser;

                    if (atk_greater)
                        greaters["p.s_atk"] = atk_greater;

                    if (atk_lesser)
                        lessers["p.s_atk"] = atk_lesser;

                    if (spatk_greater)
                        greaters["p.s_spatk"] = spatk_greater;

                    if (spatk_lesser)
                        lessers["p.s_spatk"] = spatk_lesser;

                    if (def_greater)
                        greaters["p.s_def"] = def_greater;

                    if (def_lesser)
                        lessers["p.s_def"] = def_lesser;

                    if (spdef_greater)
                        greaters["p.s_spdef"] = spdef_greater;

                    if (spdef_lesser)
                        lessers["p.s_spdef"] = spdef_lesser;

                    if (spd_greater)
                        greaters["p.s_spd"] = spd_greater;

                    if (spd_lesser)
                        lessers["p.s_spd"] = spd_lesser;

                    if (hp_greater)
                        greaters["p.s_hp"] = hp_greater;

                    if (hp_lesser)
                        lessers["p.s_hp"] = hp_lesser;

                    if (level_greater)
                        greaters["p.level"] = level_greater;

                    if (level_lesser)
                        lessers["p.level"] = level_lesser;

                    if (iv_greater)
                        greaters["((CAST(p.s_atk + p.s_spatk + p.s_def + p.s_spdef + p.s_spd + p.s_hp AS FLOAT)/186) * 100)"] = iv_greater;

                    if (iv_lesser)
                        lessers["((CAST(p.s_atk + p.s_spatk + p.s_def + p.s_spdef + p.s_spd + p.s_hp AS FLOAT)/186) * 100)"] = iv_lesser;

                    if (sorting_order)
                        switch (sorting_order) {
                            case 0:
                                orderBy += " ASC";
                                break;
                            case 1:
                                orderBy += " DESC";
                                break;
                            case 2:
                                orderBy = "((CAST(p.s_atk + p.s_spatk + p.s_def + p.s_spdef + p.s_spd + p.s_hp AS FLOAT)/186) * 100) ASC";
                                break;
                            case 3:
                                orderBy = "((CAST(p.s_atk + p.s_spatk + p.s_def + p.s_spdef + p.s_spd + p.s_hp AS FLOAT)/186) * 100) DESC";
                                break;
                        }

                    if (page) page--;

                    const { values, text } = builder.select("market as m", "m.id, p.level, p.pokemon, m.price, p.s_hp, p.s_atk, p.s_def, p.s_spatk, p.s_spdef, p.s_spd, p.nature, p.user_id")
                        .join("pokemon as p", { "m.id": "p.id" }, "INNER")
                        .where(where)
                        .and(name ? { "p.pokemon": `%${name.replace(/ /gmi, '-')}%` } : { 1: 1 }, name ? "ilike" : undefined)
                        .and(greaters, ">=")
                        .and(lessers, "<=")
                        .orderby(orderBy);

                    const query = await msg.client.postgres.unsafe(text + " OFFSET " + (page * 20), values);

                    return await msg.reply({
                        embeds: [{
                            description: query.map(x => new Pokemon(x)).map(x => `**ID**: \`${x.id}\` | **${capitalize(x.pokemon.replace(/-/gmi, ' '))}**${x.shiny ? " ⭐" : ""} | Level: ${x.level} | IV: ${x.calculateTotalIV()}% | Price: ${x.price}`).join("\n") + `\n\n- Buy the Pokemon through </market buy:${msg.commandId}>\n- Check the Pokemon through </market info:${msg.commandId}>`,
                            title: "Market",
                            color: 44678,
                            footer: {
                                text: `Showing ${page * 20 || 1}-${page * 20 + 20} Pokémon matching this search.`
                            }
                        }]
                    })
                }
                case "buy": {
                    // Find Pokemon
                    const [foundPokemon] = await msg.client.postgres`SELECT * FROM pokemon as p INNER JOIN market as m ON p.id = m.id WHERE m.id = ${msg.options.getInteger("id")}; `;

                    // Reject nonExistent
                    if (!foundPokemon) return await msg.reply("That Pokemon does not exist...");

                    // Pokedex-Ready
                    const marketedPokemon = new Pokedex(foundPokemon);

                    // Owner wanting their Pokemon Back
                    if (marketedPokemon.user_id == You.id) {

                        // Remove Pokemon from Market
                        await msg.client.postgres`DELETE FROM market WHERE id = ${foundPokemon.id}`;
                        // Remove Market Status
                        await msg.client.postgres`UPDATE pokemon SET market = false WHERE id = ${foundPokemon.id}`;
                        // Send Output
                        return msg.reply("Pokemon removed from the slave market successfully!");

                    }

                    const { bal } = await You.fetchIncome(msg.client.postgres);

                    // Reject if user does not have enough
                    if (bal < marketedPokemon.price)
                        return await msg.reply("You do not possess the necessary credits.");

                    try {
                        // Attempt Transfer to User
                        await msg.client.postgres.begin(sql => [
                            sql`UPDATE pokemon SET market = false, user_id = ${You.id}, idx = ((SELECT MAX(idx) as id FROM pokemon WHERE user_id = ${You.id} LIMIT 1) + 1) WHERE id = ${marketedPokemon.id}`,
                            sql`DELETE FROM market WHERE id = ${marketedPokemon.id}`,
                            sql`UPDATE users SET bal = bal + ${marketedPokemon.price} WHERE id = ${marketedPokemon.user_id}`,
                            sql`UPDATE users SET bal = bal - ${marketedPokemon.price} WHERE id = ${You.id}`
                        ]);

                        return await msg.reply(`Congratulations, you successfully claimed the Level ${marketedPokemon.level} ${capitalize(marketedPokemon.pokemon.replace(/-/gmi, ' '))}`);
                    } catch (error) {
                        return await msg.reply(`Error occurred, rolling back changes.`);
                    }
                }
                case "sell": {

                    let idx = msg.options.getInteger("id"),
                        price = msg.options.getInteger("price");

                    const [foundPokemon] = await msg.client.postgres`SELECT id, pokemon, level, s_hp, s_atk, s_def, s_spatk, s_spdef, s_spd, nature FROM pokemon WHERE idx = ${idx} AND user_id = ${You.id}`;

                    if (!foundPokemon)
                        return await msg.reply("That Pokemon does not exist...");

                    if (await You.isMarketing(msg.client.redis))
                        return await msg.reply("You are currently selling something");

                    await You.setOnGoingMarket(msg.client.redis);

                    const modal = new ModalBuilder()
                        .setCustomId('market-sell')
                        .setTitle("Pokemon Market Confirmation")
                        .addComponents(new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('pokemon_name')
                                .setLabel("Confirmation")
                                .setPlaceholder(`Write down '${foundPokemon.pokemon}'`)
                                .setStyle(TextInputStyle.Short)
                        ));

                    await msg.showModal(modal);

                    try {
                        const modalResponse = await msg.awaitModalSubmit({
                            filter: (x) => {
                                return x.customId == "market-sell" && x.user.id == msg.user.id;
                            }, time: 60_000
                        });

                        if (modalResponse.isModalSubmit()) {
                            const pokemonName = modalResponse.fields.getTextInputValue('pokemon_name').toLowerCase();
                            if (pokemonName == foundPokemon.pokemon) {
                                const sqlCompletion = await msg.client.postgres.begin(sql => [
                                    sql`INSERT INTO market (id, price) VALUES (${foundPokemon.id}, ${price}) ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price`,
                                    sql`UPDATE pokemon SET market = true WHERE id = ${foundPokemon.id}`
                                ]);

                                if (sqlCompletion)
                                    return modalResponse.reply(`Marketing Confirmed ✅ Your Lvl ${foundPokemon.level} ${capitalize(foundPokemon.pokemon, true)} was put for sale for ${price} Pokedits. #\`${foundPokemon.id}\``);
                            }
                            msg.followUp("Wrong answer...");
                        }
                    } catch (error) {
                        console.log(error);
                        msg.followUp("Seems like you didn't answer in time");
                    }

                }
            }
        } catch (error) {
            console.log(error);
        }
    }
}
