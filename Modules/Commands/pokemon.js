import { SlashCommandBuilder } from "discord.js";
import capitalize from "../../Utilities/Misc/capitalize.js";
import pokemonFilter from "../../Utilities/Pokemon/pokemonFilter.js";

// Enhanced parser for mention-based arguments
function parseMentionArgs(content) {
    let args = content.trim().split(/\s+/);
    if (args[0]?.toLowerCase() === "pokemon") args.shift();

    const options = {};
    let queryParts = [];
    let i = 0;
    while (i < args.length) {
        if (args[i].startsWith("--")) {
            const key = args[i].replace(/^--/, '').toLowerCase();

            // Boolean options
            if (["help"].includes(key)) {
                options[key] = true;
                i++;
                continue;
            }

            // Check for --key operator value (e.g., --iv > 25)
            if (
                i + 2 < args.length &&
                /^[<>=!]=?|==?$/.test(args[i + 1]) &&
                !args[i + 2].startsWith("--")
            ) {
                // Store as a filter string
                queryParts.push(`${key} ${args[i + 1]} ${args[i + 2]}`);
                i += 3;
                continue;
            }

            // Check for --key value
            if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
                options[key] = args[i + 1];
                i += 2;
                continue;
            }

            // Just --key (boolean)
            options[key] = true;
            i++;
        } else {
            queryParts.push(args[i]);
            i++;
        }
    }
    options.query = queryParts.join(" ");
    return options;
}

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('pokemon')
        .setNameLocalizations({
            'pt-BR': 'pokemon',
            'es-ES': 'pokemon',
            'de': 'pokemon',
            'fr': 'pokemon',
            // 'ar': 'بوكيمون'
        })
        .setDescription('List your Pokemon')
        .setDescriptionLocalizations({
            'pt-BR': 'Liste seus Pokémon',
            'es-ES': 'Lista tus Pokémon',
            'de': 'Liste deine Pokémon auf',
            'fr': 'Listez vos Pokémon',
            // 'ar': 'اعرض قائمة بوكيموناتك'
        })
        .addNumberOption(option => option.setName('page').setDescription('Page of Pokemon list')
            .setNameLocalizations({
                'pt-BR': 'pagina',
                'es-ES': 'pagina',
                'de': 'seite',
                'fr': 'page',
                // 'ar': 'صفحة'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'Página da lista de Pokémon',
                'es-ES': 'Página de la lista de Pokémon',
                'de': 'Seite der Pokémon-Liste',
                'fr': 'Page de la liste de Pokémon',
                // 'ar': 'صفحة قائمة البوكيمون'
            }))
        .addStringOption(option => option.setName('orderby').setDescription('1 - idx; 2 - iv; 3 - level; 4 - alphabetic').addChoices({ name: "IDX", value: "idx" }, { name: "IV", value: "iv" }, { name: "Level", value: "level" }, { name: "Alphabetical", value: "pokemon" })
            .setNameLocalizations({
                'pt-BR': 'ordenarpor',
                'es-ES': 'ordenarpor',
                'de': 'sortierenach',
                'fr': 'trierpar',
                // 'ar': 'ترتيب-حسب'
            })
            .setDescriptionLocalizations({
                'pt-BR': '1 - idx; 2 - iv; 3 - nível; 4 - alfabético',
                'es-ES': '1 - idx; 2 - iv; 3 - nivel; 4 - alfabético',
                'de': '1 - idx; 2 - iv; 3 - level; 4 - alphabetisch',
                'fr': '1 - idx; 2 - iv; 3 - niveau; 4 - alphabétique',
                // 'ar': '1 - idx; 2 - iv; 3 - المستوى; 4 - أبجدي'
            }))
        .addStringOption(option => option.setName('ordertype').setDescription('ASC (default), Desc').addChoices({ name: "Ascending", value: "asc" }, { name: "Descending", value: "desc" })
            .setNameLocalizations({
                'pt-BR': 'tipodeordem',
                'es-ES': 'tipodeorden',
                'de': 'sortierungstyp',
                'fr': 'typedeclassement',
                // 'ar': 'نوع-الترتيب'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'ASC (padrão), Desc',
                'es-ES': 'ASC (predeterminado), Desc',
                'de': 'ASC (Standard), Desc',
                'fr': 'ASC (par défaut), Desc',
                // 'ar': 'تصاعدي (افتراضي)، تنازلي'
            }))
        .addStringOption(option => option.setName('query').setDescription('Enter the needed query. [Read Query cheatsheet for more help]')
            .setNameLocalizations({
                'pt-BR': 'consulta',
                'es-ES': 'consulta',
                'de': 'abfrage',
                'fr': 'requête',
                // 'ar': 'استعلام'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'Digite a consulta necessária. [Leia a folha de dicas de consulta para mais ajuda]',
                'es-ES': 'Introduce la consulta necesaria. [Lee la hoja de trucos de consulta para más ayuda]',
                'de': 'Gib die benötigte Abfrage ein. [Lies das Query-Cheatsheet für weitere Hilfe]',
                'fr': 'Entrez la requête nécessaire. [Lisez la feuille de triche de requête pour plus d\'aide]',
                // 'ar': 'أدخل الاستعلام المطلوب. [اقرأ ورقة الغش الخاصة بالاستعلام لمزيد من المساعدة]'
            }))
        .addStringOption(option => option.setName('export').setDescription("Export choices")
            .setNameLocalizations({
                'pt-BR': 'exportar',
                'es-ES': 'exportar',
                'de': 'exportieren',
                'fr': 'exporter',
                // 'ar': 'تصدير'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'Opções de exportação',
                'es-ES': 'Opciones de exportación',
                'de': 'Exportoptionen',
                'fr': 'Choix d\'exportation',
                // 'ar': 'خيارات التصدير'
            })
            .addChoices({
            name: "ID Export",
            value: "id-export"
        }, {
            name: "CSV Export",
            value: "csv-export"
        }))
        .addBooleanOption(option => option.setName("help").setDescription("View details on how to use this command")
            .setNameLocalizations({
                'pt-BR': 'ajuda',
                'es-ES': 'ayuda',
                'de': 'hilfe',
                'fr': 'aide',
                // 'ar': 'مساعدة'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'Veja detalhes sobre como usar este comando',
                'es-ES': 'Ver detalles sobre cómo usar este comando',
                'de': 'Details zur Verwendung dieses Befehls anzeigen',
                'fr': 'Voir les détails sur la façon d\'utiliser cette commande',
                // 'ar': 'عرض تفاصيل حول كيفية استخدام هذا الأمر'
            })),
    alias: ['p'],
    mention_support: true,
    async execute(msg) {
        let page, orderBy, query, orderType, exportOption, helpFlag;

        if (msg.isMessage) {
            // Mention-based parsing
            const opts = parseMentionArgs(msg.content);

            helpFlag = !!opts.help;
            page = opts.page && /^\d+$/.test(opts.page) ? Number(opts.page) - 1 : 0;

            // Only allow specific orderBy values
            const allowedOrderBy = ["idx", "iv", "level", "pokemon"];
            orderBy = allowedOrderBy.includes(opts.orderby) ? opts.orderby : undefined;

            // Only allow asc/desc for orderType
            orderType = ["asc", "desc"].includes((opts.ordertype || "").toLowerCase()) ? opts.ordertype.toLowerCase() : undefined;

            // Only allow specific export options
            const allowedExport = ["id-export", "csv-export"];
            exportOption = allowedExport.includes(opts.export) ? opts.export : undefined;

            // Sanitize query: allow only safe characters (alphanumeric, spaces, dashes, and some symbols)
            query = typeof opts.query === "string" ? opts.query.replace(/[^a-zA-Z0-9\s\-_<>=!%*"'.,]/g, "") : "";
            
        } else {
            // Slash command options
            helpFlag = msg.options.getBoolean("help");
            page = (msg.options.getNumber("page") || 1) - 1;
            orderBy = msg.options.getString("orderby");
            orderType = msg.options.getString("ordertype");
            exportOption = msg.options.getString('export');
            query = msg.options.getString("query") || "";
        }

        // Redirect to Help
        if (helpFlag)
            return msg.options?._hoistedOptions?.push?.({ name: "command_name", type: 3, value: "pokemon" }),
                msg.client.commands.get("help")(msg);

        // User Defaults
        let userDefault = (await msg.client.postgres`SELECT order_by FROM users WHERE id = ${msg.user.id}`)?.[0]?.order_by;

        if (orderBy == "iv")
            orderBy = "((CAST(s_atk + s_spatk + s_def + s_spdef + s_spd + s_hp AS FLOAT)/186) * 100)";

        if (!orderBy && userDefault) {
            if (userDefault.startsWith("idx")) orderBy = "idx";
            if (userDefault.startsWith("iv")) orderBy = "((CAST(s_atk + s_spatk + s_def + s_spdef + s_spd + s_hp AS FLOAT)/186) * 100)";
            if (userDefault.startsWith("l")) orderBy = "level";
            if (userDefault.startsWith("a")) orderBy = "pokemon";
        }

        if (orderType == undefined && userDefault) {
            if (userDefault.endsWith("asc")) orderType = "asc";
            if (userDefault.endsWith("desc")) orderType = "desc";
        }

        // Pokemon that passed Filter
        const passedFilteredPokemon = await pokemonFilter(msg.user.id, query.replace(/—/gmi, '--'), page, orderBy, orderType);

        const totalPokemon = await pokemonFilter(msg.user.id, query.replace(/—/gmi, '--'), -1);

        if (!passedFilteredPokemon.length) return await msg.reply("Nothing passed that filter...");

        // Design value
        let numberLength = (passedFilteredPokemon.map(x => x.idx).sort((x, y) => y - x)[0]).toString().length;

        if (exportOption) {
            switch (exportOption) {
                case "id-export":
                    return await msg.reply({
                        embeds: [{
                            title: "ID Export",
                            description: `\`${passedFilteredPokemon.map(x => x.idx).join(", ")}\``
                        }]
                    });

                case "csv-export":
                    return await msg.reply("Under development");
            }
        }

        await msg.reply({
            embeds: [{
                title: 'Your Pokemon',
                description: `${passedFilteredPokemon.map(x => {
                    return `\`${" ".repeat(numberLength - (x.idx || 0).toString().length)}${x.idx || 0}\`　　${capitalize(x.pokemon, true)} ${x.name ? "\"**" + capitalize(x.name) + "**\"" : ""}${x.shiny ? " ⭐" : ""}　•　Level: ${x.level}　•　**IV**: ${x.totalIV}%`;
                }).join("\n")}`,
                footer: {
                    text: `Showing ${passedFilteredPokemon[0].idx} - ${passedFilteredPokemon[passedFilteredPokemon.length - 1].idx} of ${totalPokemon} Pokémon matching this search. [ Page ${page + 1} of ${Math.max(1, Math.round(totalPokemon / 20))} ]`
                },
                color: 44678
            }]
        });
    }
}