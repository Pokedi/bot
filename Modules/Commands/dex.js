import { ActionRowBuilder, AttachmentBuilder, AttachmentFlags, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags, SlashCommandBuilder } from "discord.js";
import dexPokemonInfoModule from "../../Utilities/Pokemon/dexPokemonInfoModule.js";
import capitalize from "../../Utilities/Misc/capitalize.js";
import Pokedex from "../../Classes/pokedex.js";
import pokemondb from "../Database/pokedb.js";
import getDominantColor from "../../Utilities/Misc/getDominantColor.js";
import { existsSync } from "fs";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('dex')
        .setNameLocalizations({
            'pt-BR': 'pokedex',
            'es-ES': 'pokedex',
            'de': 'pokedex',
            'fr': 'pokédex',
            // 'ar': 'بوكيديكس'
        })
        .setDescription('View your Pokemon!')
        .setDescriptionLocalizations({
            'pt-BR': 'Veja seus Pokémon!',
            'es-ES': '¡Mira tus Pokémon!',
            'de': 'Sieh dir deine Pokémon an!',
            'fr': 'Voir vos Pokémon!',
            // 'ar': 'اعرض بوكيموناتك!'
        })
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
            }))
        .addStringOption(option => option.setName('pokemon').setDescription('Name of the Pokemon you are searching')
            .setNameLocalizations({
                'pt-BR': 'pokemon',
                'es-ES': 'pokemon',
                'de': 'pokemon',
                'fr': 'pokémon',
                // 'ar': 'بوكيمون'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'Nome do Pokémon que você está procurando',
                'es-ES': 'Nombre del Pokémon que estás buscando',
                'de': 'Name des gesuchten Pokémons',
                'fr': 'Nom du Pokémon que vous recherchez',
                // 'ar': 'اسم البوكيمون الذي تبحث عنه'
            }))
        .addBooleanOption(option => option.setName("progress").setDescription("Check your progress with the Pokedex")
            .setNameLocalizations({
                'pt-BR': 'progresso',
                'es-ES': 'progreso',
                'de': 'fortschritt',
                'fr': 'progrès',
                // 'ar': 'تقدم'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'Verifique seu progresso com a Pokédex',
                'es-ES': 'Consulta tu progreso con la Pokédex',
                'de': 'Überprüfen Sie Ihren Fortschritt mit dem Pokédex',
                'fr': 'Vérifiez votre progression avec le Pokédex',
                // 'ar': 'تحقق من تقدمك في البوكيديكس'
            }))
        .addBooleanOption(option => option.setName("claim").setDescription("Claim your prizes!")
            .setNameLocalizations({
                'pt-BR': 'reivindicar',
                'es-ES': 'reclamar',
                'de': 'beanspruchen',
                'fr': 'réclamer',
                // 'ar': 'مطالبة'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'Reivindique seus prêmios!',
                'es-ES': '¡Reclama tus premios!',
                'de': 'Fordere deine Preise an!',
                'fr': 'Réclamez vos prix!',
                // 'ar': 'طالب بجوائزك!'
            }))
        .addIntegerOption(option => option.setName("page").setDescription("Select the page of the Progressing Pokedex").setMinValue(1)
            .setNameLocalizations({
                'pt-BR': 'pagina',
                'es-ES': 'pagina',
                'de': 'seite',
                'fr': 'page',
                // 'ar': 'صفحة'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'Selecione a página da Pokédex em andamento',
                'es-ES': 'Selecciona la página de la Pokédex en progreso',
                'de': 'Wählen Sie die Seite des fortschreitenden Pokédex aus',
                'fr': 'Sélectionnez la page du Pokédex en cours',
                // 'ar': 'حدد صفحة البوكيديكس المتقدم'
            }))
        .addBooleanOption(option => option.setName("shiny").setDescription("Set to true if you\'re looking for the Shiny version")
            .setNameLocalizations({
                'pt-BR': 'brilhante',
                'es-ES': 'variocolor',
                'de': 'schillernd',
                'fr': 'brillant',
                // 'ar': 'لامع'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'Defina como verdadeiro se estiver procurando a versão Brilhante',
                'es-ES': 'Establecer en verdadero si buscas la versión Variocolor',
                'de': 'Auf „wahr“ setzen, wenn Sie nach der Schillernden-Version suchen',
                'fr': 'Mettre à vrai si vous recherchez la version Brillante',
                // 'ar': 'اضبط على "صحيح" إذا كنت تبحث عن الإصدار اللامع'
            })),
    async execute(msg) {

        if (msg.options.getBoolean("help"))
            return msg.options._hoistedOptions.push({ name: "command_name", type: 3, value: "dex" }),
                msg.client.commands.get("help")(msg);

        const pokemonName = msg.options.getString('pokemon');

        if (pokemonName) {

            let selectedPokemon = new Pokedex();

            await selectedPokemon.getPokemonSpecies(pokemonName);

            // findPokemon(pokemonName, false);

            if (!selectedPokemon || !selectedPokemon.pokedex.id) return msg.reply("This pokemon does not exist, for some reason?");

            // Fetch dex Data
            await selectedPokemon.fetchDexData();

            // Check if User wants a Shiny
            selectedPokemon.pokedex.shiny = msg.options.getBoolean("shiny");

            // Components
            const buttonComponent = [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('info-button').setEmoji('ℹ').setStyle(ButtonStyle.Secondary))];

            const isShinyThere = selectedPokemon.pokedex.shiny && existsSync(`../pokediAssets/pokemon/${selectedPokemon.pokedex.shiny ? "shiny" : "regular"}/${selectedPokemon.pokedex._id}.png`)

            const file = new AttachmentBuilder(`../pokediAssets/pokemon/${selectedPokemon.pokedex.shiny && isShinyThere ? "shiny" : "regular"}/${selectedPokemon.pokedex._id}.png`);

            const color = await getDominantColor(file.attachment, true);

            // Pokemon Embed
            const pokemonEmbed = dexPokemonInfoModule(selectedPokemon.pokedex, color);

            // Send Embed
            const message = await msg.reply({
                embeds: [pokemonEmbed], withResponse: true, components: buttonComponent,
                files: [file]
            });

            // Ready Other Embed
            const secondEmbed = {
                title: `#${selectedPokemon.pokedex.id} - ${capitalize(selectedPokemon.pokedex.name)}`,
                fields: [],
                thumbnail: {
                    url: `attachment://${selectedPokemon.pokedex._id}.png`
                },
                image: null,
                color,
                components: buttonComponent
            };

            if (selectedPokemon.pokedex.evolution_chain.length) {

                if (selectedPokemon.pokedex.evolution_chain.find(x => x.trigger == "use-item" && x.name != selectedPokemon.pokedex._id))
                    // Push Buyable Items
                    secondEmbed.fields.push({
                        name: "🛍️ Items", value: (() => {
                            if (!selectedPokemon.pokedex.evolution_chain.length || !selectedPokemon.pokedex.evolution_chain.find(x => x.trigger == "use-item" && x.name != selectedPokemon.pokedex._id))
                                return "~ Nothing ~";

                            return selectedPokemon.pokedex.evolution_chain.filter(x => x.trigger == "use-item").map(x => {
                                return `**${capitalize(selectedPokemon.pokedex.name, true)}** + **${capitalize(x.item_name)}** => **${capitalize(x.name)}** ${x.item_price ? "(💵" + (x.item_price) + ")" : ""}`
                            }).join("\n") + "\n To buy the item, just `/shop item:<item name>`";
                        }
                        )()
                    });

                // Push Tradable Evolutions
                if (selectedPokemon.pokedex.evolution_chain.find(x => x.trigger == "trade" && x.name != selectedPokemon.pokedex._id))
                    secondEmbed.fields.push({
                        name: "🗃️ Trade Evolution",
                        value: selectedPokemon.pokedex.evolution_chain.filter(x => x.trigger == "trade").map(x => `**${capitalize(!x.item_name ? "No Item Required" : x.item_name.replace(/-/g, ''))}** + Trade => ${capitalize(x.name)}`).join("\n") || "~ Not Available ~",
                        inline: true
                    })
            }

            if (selectedPokemon.pokedex.fusions.length)
                // Push Fusions
                secondEmbed.fields.push({
                    name: "♊ Fusion",
                    value: selectedPokemon.pokedex.fusions.map(x => `**${capitalize(x.first_pokemon)}** + **${capitalize(x.second_pokemon)}** => **${capitalize(x.evolved_pokemon)}**`).join("\n")
                });

            if (selectedPokemon.pokedex.forms.length) {

                const forms = selectedPokemon.pokedex.forms;
                // Push Misc Conditions
                // Mega
                const megaPokemon = forms.find(x => x.name.endsWith("mega"))
                if (megaPokemon) {
                    secondEmbed.fields.push({
                        name: "🔴 Mega",
                        value: capitalize(megaPokemon.name.replace(/-/gmi, ' ')),
                        inline: true
                    });
                };

                // MegaX
                const megaXPokemon = forms.find(x => x.name.endsWith("mega-x"))
                if (megaXPokemon) {
                    secondEmbed.fields.push({
                        name: "🔴 Mega X",
                        value: capitalize(megaXPokemon.name.replace(/-/gmi, ' ')),
                        inline: true
                    });
                };

                // Mega Y
                const megaYPokemon = forms.find(x => x.name.endsWith("mega-y"))
                if (megaYPokemon) {
                    secondEmbed.fields.push({
                        name: "🔴 Mega Y",
                        value: capitalize(megaYPokemon.name.replace(/-/gmi, ' ')),
                        inline: true
                    });
                };

                // Mega Y
                const primalPokemon = forms.find(x => x.name.endsWith("primal"))
                if (primalPokemon) {
                    secondEmbed.fields.push({
                        name: "🟡 Primal",
                        value: capitalize(primalPokemon.name.replace(/-/gmi, ' ')),
                        inline: true
                    });
                };

                const timeEvolution = selectedPokemon.pokedex.evolution_chain.filter(x => x.time_of_day && !x.min_happiness);
                if (timeEvolution.length)
                    secondEmbed.fields.push({
                        name: "🕰️ Time",
                        value: timeEvolution.map(x => `${capitalize(selectedPokemon.pokedex.name)} + ${capitalize(x.time_of_day)} + Level Up${x.min_level ? " to " + x.min_level : ""} => ${capitalize(x.name)}`).join("\n"),
                        inline: true
                    });

                // To-Do: Evolve by Pokemon Name
                // To-Do: Evolve by Channel Name

                const affectionEvolution = selectedPokemon.pokedex.evolution_chain.filter(x => x.min_happiness);
                if (affectionEvolution.length)
                    secondEmbed.fields.push({
                        name: "💖 Affection",
                        value: affectionEvolution.map(x => `${capitalize(selectedPokemon.pokedex.name)} + Love${x.time_of_day ? " + " + capitalize(x.time_of_day) : ""} + Level Up${x.min_level ? " to " + x.min_level : ""} => ${capitalize(x.name)}`).join("\n"),
                        inline: false
                    });

                const otherForms = selectedPokemon.pokedex.forms.filter(x => x._id && ![megaXPokemon, megaYPokemon, primalPokemon].concat().filter(x => x).map(y => y._id).includes(x._id))
                if (otherForms.length)
                    secondEmbed.fields.push({
                        name: "🌅 Other Forms",
                        value: otherForms.map(x => `${capitalize(selectedPokemon.pokedex.name)} + ❓ => ${capitalize((x._id).replace(/-/gmi, ' '))}`).join("\n") + "\n- You must find out how to get them to turn into these! Your adventure awaits!",
                        inline: false
                    });
            }

            if (!secondEmbed.fields.length)
                secondEmbed.fields.push({
                    name: "Note",
                    value: "This Pokemon does not seem to have any other evolutionary information available at the moment."
                });

            // await message.react("ℹ️");

            let toggle = 0;

            const collector = message.resource.message.createMessageComponentCollector({
                componentType: ComponentType.Button,
                // maxEmojis: 10,
                // filter: (reaction, user) => { return user.id === msg.user.id }, 
                time: 30000
            });

            collector.on('collect', (i) => {
                if (i.user.id == msg.user.id) {
                    message.resource.message.edit({ embeds: [!toggle ? secondEmbed : pokemonEmbed] });
                    toggle = !toggle;
                }

                i.reply({ flags: MessageFlags.Ephemeral, content: "👍" });
            });

            collector.on('end', collected => {
            });

            return;

        }

        const claim = msg.options.getBoolean('claim');

        if (claim) {
            const unclaimedPokemon = await msg.client.postgres`SELECT unclaimed_normal, unclaimed_shinies FROM dex WHERE user_id = ${msg.user.id} AND (unclaimed_normal > 0 OR unclaimed_shinies > 0)`;

            if (!unclaimedPokemon.length) return msg.reply("No Pokemon available to be claimed");

            let credits = 0;

            for (const i of unclaimedPokemon) {
                if (i.unclaimed_normal > 0) credits += i.unclaimed_normal * 200;
                if (i.unclaimed_shinies > 0) credits += i.unclaimed_shinies * 2000;
            }

            try {
                await msg.client.postgres.begin(sql => [
                    sql`UPDATE dex SET unclaimed_normal = 0, unclaimed_shinies = 0 WHERE user_id = ${msg.user.id} AND (unclaimed_normal > 0 OR unclaimed_shinies > 0)`,
                    sql`UPDATE users SET bal = bal + ${credits} WHERE id = ${msg.user.id}`
                ]);

                return msg.reply(`Congrats! You got ${credits} pokedits for claiming ${unclaimedPokemon.length} Pokemon!`);
            } catch (error) {
                return msg.reply(`An error occurred claiming your pokedits. Contact an admin!`);
            }
        }

        const progress = msg.options.getBoolean('progress');

        if (progress || !progress) {

            const page = (msg.options.getInteger("page") || 1) - 1;

            const [{ count: grabPokemonLength }] = await pokemondb`SELECT count(true) as count FROM pokemon_v2_pokemonspecies`;

            const selectedPokemon = await pokemondb`SELECT id, name FROM pokemon_v2_pokemonspecies ORDER BY id ASC LIMIT 20 OFFSET ${page * 20}`;

            if (page * 20 > grabPokemonLength) return msg.reply("Sorry, no pokemon to display in that page");

            const user_dex = await msg.client.postgres`SELECT * FROM dex WHERE pokemon in ${msg.client.postgres(selectedPokemon.map(x => x.name))} AND user_id = ${msg.user.id}` || [{}];

            // if (!user_dex[0]) return msg.reply("You didn't catch anything yet");

            let startingID = 0;

            let userDex = user_dex[0] ? Object.assign(...user_dex.map(x => ({ [x.pokemon]: x }))) : [];

            return await msg.reply({
                embeds: [{
                    title: "Pokedex",
                    description: `You've got ${user_dex.count} pokemon so far, where ${grabPokemonLength - user_dex.count} are uncaught. Use \`/pokedex claim\` to claim all rewards.`,
                    fields: selectedPokemon.map(pk => {
                        if (!startingID) startingID = pk.id;
                        if (!userDex[pk.name]) userDex[pk.name] = { count: 0 };
                        return {
                            name: capitalize(pk.name.replace(/-/gmi, ' ')) + " #" + pk.id,
                            inline: true,
                            value: userDex[pk.name].count ? `Caught ${(userDex[pk.name].count || 0) > 0 ? userDex[pk.name].count + userDex[pk.name].shinies : 0}! ${(userDex[pk.name].unclaimed_normal || userDex[pk.name]?.unclaimed_shinies) ? "💰" : ""}` : "Not caught yet"
                        };
                    }),
                    footer: {
                        text: `Showing ${startingID}-${startingID + 20} of ${grabPokemonLength} Pokémon.`
                    },
                    color: 44678
                }]
            });
        }

        await msg.reply(`For your progress \`/dex progress: true\` and for the Dex Pokemon \`/dex pokemon: Charizard\``);
    }
}
