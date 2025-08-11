import { SlashCommandBuilder } from "discord.js";
import Player from "../../Classes/player.js";
import capitalize from "../../Utilities/Misc/capitalize.js";
import Color from "color";
import Pokedex from "../../Classes/pokedex.js";
import separateArray from "../../Utilities/Misc/separateArray.js";
import Move from "../../Classes/move.js";
import { ENUM_TYPE_COLORS } from "../../Utilities/Data/enums.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('moves')
        .setNameLocalizations({
            'pt-BR': 'movimentos',
            'es-ES': 'movimientos',
            'de': 'attacken',
            'fr': 'attaques',
            'ar': 'حركات'
        })
        .setDescription('View possible and set Pokemon moves')
        .setDescriptionLocalizations({
            'pt-BR': 'Veja os movimentos possíveis e defina os movimentos do Pokémon',
            'es-ES': 'Ver movimientos posibles y establecer movimientos de Pokémon',
            'de': 'Mögliche Attacken anzeigen und Pokémon-Attacken festlegen',
            'fr': 'Voir les attaques possibles et définir les attaques de Pokémon',
            'ar': 'عرض الحركات الممكنة وتعيين حركات البوكيمون'
        })
        .addSubcommand(y => y
            .setName("info")
            .setNameLocalizations({
                'pt-BR': 'info',
                'es-ES': 'info',
                'de': 'info',
                'fr': 'info',
                'ar': 'معلومات'
            })
            .setDescription("Check up information on moves!")
            .setDescriptionLocalizations({
                'pt-BR': 'Verifique informações sobre movimentos!',
                'es-ES': '¡Comprueba la información sobre los movimientos!',
                'de': 'Überprüfe Informationen zu Attacken!',
                'fr': 'Vérifiez les informations sur les attaques!',
                'ar': 'تحقق من المعلومات حول الحركات!'
            })
            .addIntegerOption(x => x
                .setName("move-info")
                .setNameLocalizations({
                    'pt-BR': 'info-movimento',
                    'es-ES': 'info-movimiento',
                    'de': 'attacken-info',
                    'fr': 'info-attaque',
                    'ar': 'معلومات-الحركة'
                })
                .setDescription("Get information on the Move you selected")
                .setDescriptionLocalizations({
                    'pt-BR': 'Obtenha informações sobre o Movimento que você selecionou',
                    'es-ES': 'Obtén información sobre el Movimiento que seleccionaste',
                    'de': 'Erhalte Informationen über die von dir ausgewählte Attacke',
                    'fr': 'Obtenez des informations sur l\'attaque que vous avez sélectionnée',
                    'ar': 'احصل على معلومات حول الحركة التي حددتها'
                })
                .setAutocomplete(true)
            )
            .addIntegerOption(x => x
                .setName('pokemon-slot')
                .setNameLocalizations({
                    'pt-BR': 'espaco-pokemon',
                    'es-ES': 'ranura-pokemon',
                    'de': 'pokemon-platz',
                    'fr': 'emplacement-pokemon',
                    'ar': 'فتحة-البوكيمون'
                })
                .setDescription("Select the Pokemon you want to check [Default: 1]")
                .setDescriptionLocalizations({
                    'pt-BR': 'Selecione o Pokémon que você quer verificar [Padrão: 1]',
                    'es-ES': 'Selecciona el Pokémon que quieres comprobar [Predeterminado: 1]',
                    'de': 'Wähle das Pokémon aus, das du überprüfen möchtest [Standard: 1]',
                    'fr': 'Sélectionnez le Pokémon que vous voulez vérifier [Défaut: 1]',
                    'ar': 'حدد البوكيمون الذي تريد التحقق منه [الافتراضي: 1]'
                })
                .setMaxValue(6)
                .setMinValue(1)
            )
            .addBooleanOption(x => x
                .setName("level-moves")
                .setNameLocalizations({
                    'pt-BR': 'movimentos-nivel',
                    'es-ES': 'movimientos-nivel',
                    'de': 'level-attacken',
                    'fr': 'attaques-niveau',
                    'ar': 'حركات-المستوى'
                })
                .setDescription("Show Moves you can gain through leveling up your Pokemon")
                .setDescriptionLocalizations({
                    'pt-BR': 'Mostre os Movimentos que você pode ganhar ao subir o nível do seu Pokémon',
                    'es-ES': 'Muestra los Movimientos que puedes obtener al subir de nivel a tu Pokémon',
                    'de': 'Zeige Attacken, die du durch das Aufleveln deines Pokémon erhalten kannst',
                    'fr': 'Montrez les attaques que vous pouvez obtenir en faisant monter de niveau votre Pokémon',
                    'ar': 'أظهر الحركات التي يمكنك الحصول عليها من خلال رفع مستوى بوكيمونك'
                })
            )
            .addBooleanOption(x => x
                .setName("tm-moves")
                .setNameLocalizations({
                    'pt-BR': 'movimentos-tm',
                    'es-ES': 'movimientos-mt',
                    'de': 'tm-attacken',
                    'fr': 'attaques-ct',
                    'ar': 'حركات-tm'
                })
                .setDescription("Show Moves you can gain through buying Technical-Machines for your Pokemon")
                .setDescriptionLocalizations({
                    'pt-BR': 'Mostre os Movimentos que você pode ganhar comprando Máquinas Técnicas para o seu Pokémon',
                    'es-ES': 'Muestra los Movimientos que puedes obtener comprando Máquinas Técnicas para tu Pokémon',
                    'de': 'Zeige Attacken, die du durch den Kauf von Technischen Maschinen für dein Pokémon erhalten kannst',
                    'fr': 'Montrez les attaques que vous pouvez obtenir en achetant des Machines Techniques pour votre Pokémon',
                    'ar': 'أظهر الحركات التي يمكنك الحصول عليها من خلال شراء آلات تقنية لبوكيمونك'
                })
            )
        )
        .addSubcommand(y => y
            .setName("store")
            .setNameLocalizations({
                'pt-BR': 'loja',
                'es-ES': 'tienda',
                'de': 'laden',
                'fr': 'boutique',
                'ar': 'متجر'
            })
            .setDescription("Set or Buy moves to train your Pokemon!")
            .setDescriptionLocalizations({
                'pt-BR': 'Defina ou compre movimentos para treinar seu Pokémon!',
                'es-ES': '¡Establece o compra movimientos para entrenar a tu Pokémon!',
                'de': 'Lege oder kaufe Attacken, um dein Pokémon zu trainieren!',
                'fr': 'Définissez ou achetez des attaques pour entraîner votre Pokémon!',
                'ar': 'قم بتعيين أو شراء حركات لتدريب بوكيمونك!'
            })
            .addIntegerOption(x => x
                .setName("move-id")
                .setNameLocalizations({
                    'pt-BR': 'id-movimento',
                    'es-ES': 'id-movimiento',
                    'de': 'attacken-id',
                    'fr': 'id-attaque',
                    'ar': 'معرف-الحركة'
                })
                .setDescription("ID of the Move you wish to set or view")
                .setDescriptionLocalizations({
                    'pt-BR': 'ID do Movimento que você deseja definir ou visualizar',
                    'es-ES': 'ID del Movimiento que deseas establecer o ver',
                    'de': 'ID der Attacke, die du festlegen oder anzeigen möchtest',
                    'fr': 'ID de l\'attaque que vous souhaitez définir ou afficher',
                    'ar': 'معرف الحركة الذي ترغب في تعيينه أو عرضه'
                })
                .setAutocomplete(true)
            )
            .addIntegerOption(x => x
                .setName("tm-id")
                .setNameLocalizations({
                    'pt-BR': 'id-tm',
                    'es-ES': 'id-mt',
                    'de': 'tm-id',
                    'fr': 'id-ct',
                    'ar': 'معرف-tm'
                })
                .setDescription("ID of the TM Move you wish to set or view")
                .setDescriptionLocalizations({
                    'pt-BR': 'ID do Movimento de TM que você deseja definir ou visualizar',
                    'es-ES': 'ID del Movimiento de MT que deseas establecer o ver',
                    'de': 'ID der TM-Attacke, die du festlegen oder anzeigen möchtest',
                    'fr': 'ID de l\'attaque CT que vous souhaitez définir ou afficher',
                    'ar': 'معرف حركة TM الذي ترغب في تعيينه أو عرضه'
                })
                .setAutocomplete(true)
            )
            .addIntegerOption(x => x
                .setName("move-slot")
                .setNameLocalizations({
                    'pt-BR': 'espaco-movimento',
                    'es-ES': 'ranura-movimiento',
                    'de': 'attacken-platz',
                    'fr': 'emplacement-attaque',
                    'ar': 'فتحة-الحركة'
                })
                .setDescription("The slot in which you wish to replace the move")
                .setDescriptionLocalizations({
                    'pt-BR': 'O espaço no qual você deseja substituir o movimento',
                    'es-ES': 'La ranura en la que deseas reemplazar el movimiento',
                    'de': 'Der Platz, auf dem du die Attacke ersetzen möchtest',
                    'fr': 'L\'emplacement dans lequel vous souhaitez remplacer l\'attaque',
                    'ar': 'الفتحة التي ترغب في استبدال الحركة فيها'
                })
                .setMaxValue(4)
                .setMinValue(1)
            )
            .addIntegerOption(x => x
                .setName('pokemon-slot')
                .setNameLocalizations({
                    'pt-BR': 'espaco-pokemon',
                    'es-ES': 'ranura-pokemon',
                    'de': 'pokemon-platz',
                    'fr': 'emplacement-pokemon',
                    'ar': 'فتحة-البوكيمون'
                })
                .setDescription("Select the Pokemon you want to set a move for [Default: 1]")
                .setDescriptionLocalizations({
                    'pt-BR': 'Selecione o Pokémon para o qual você quer definir um movimento [Padrão: 1]',
                    'es-ES': 'Selecciona el Pokémon para el que quieres establecer un movimiento [Predeterminado: 1]',
                    'de': 'Wähle das Pokémon aus, für das du eine Attacke festlegen möchtest [Standard: 1]',
                    'fr': 'Sélectionnez le Pokémon pour lequel vous voulez définir une attaque [Défaut: 1]',
                    'ar': 'حدد البوكيمون الذي تريد تعيين حركة له [الافتراضي: 1]'
                })
                .setMaxValue(6)
                .setMinValue(1)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName("help")
            .setNameLocalizations({
                'pt-BR': 'ajuda',
                'es-ES': 'ayuda',
                'de': 'hilfe',
                'fr': 'aide',
                'ar': 'مساعدة'
            })
            .setDescription("Check out how to use the Market Command and apparently abandon what you gained trust of!")
            .setDescriptionLocalizations({
                'pt-BR': 'Confira como usar o Comando do Mercado e aparentemente abandonar aquilo em que você conquistou a confiança!',
                'es-ES': '¡Echa un vistazo a cómo usar el Comando del Mercado y aparentemente abandonar aquello en lo que ganaste confianza!',
                'de': 'Schau dir an, wie du den Markt-Befehl benutzt und anscheinend das aufgibst, wessen Vertrauen du gewonnen hast!',
                'fr': 'Découvrez comment utiliser la commande Marché et abandonnez apparemment ce dont vous avez gagné la confiance!',
                'ar': 'تحقق من كيفية استخدام أمر السوق والتخلي على ما يبدو عما اكتسبت ثقته!'
            })
        ),
    async execute(msg) {

        // Redirect to Help if called
        if (msg.options.getSubcommand() == "help")
            return msg.options._hoistedOptions.push({ name: "command_name", type: 3, value: "moves" }),
                msg.client.commands.get("help")(msg);

        // Check Move Info ID
        const moveInfoID = msg.options.getInteger("move-info");

        // For Move Info
        if (moveInfoID) {
            // Ready Move Class
            const foundMove = new Move({ id: moveInfoID });
            // Fetch Data
            await foundMove.fetch();
            return msg.reply({
                embeds: [{
                    color: ENUM_TYPE_COLORS[capitalize(foundMove.type)],
                    title: `Information on ${foundMove.name} || ID: ${foundMove.id}`,
                    description: foundMove.meta.description,
                    fields: [{
                        name: "Type",
                        value: capitalize(foundMove.type),
                        inline: true
                    }, {
                        name: "Damage",
                        value: foundMove.power || "No Damage",
                        inline: true
                    }, {
                        name: "Accuracy",
                        value: foundMove.accuracy || "---",
                        inline: true
                    }, {
                        name: "Damage Type",
                        value: foundMove.damage_type,
                        inline: true
                    }, {
                        name: "Status Effect",
                        value: foundMove.meta.ailment ? `${capitalize(foundMove.meta.ailment)} (${foundMove.meta.ailment_chance || 100}%)` : "No Status Effect",
                        inline: true
                    }, {
                        name: "TM Cost",
                        value: foundMove.cost ? foundMove.cost.toLocaleString() : "---",
                        inline: true
                    }]
                }]
            });
        }

        const player = new Player({ id: msg.user.id, /* guild_id: msg.guild.info.mode ? msg.guild.id : null */ });

        const pokemonSlot = (msg.options.getInteger("pokemon-slot") || 1) - 1;

        await player.fetch(msg.client.postgres);

        if (!player.started) return await msg.reply("You have not started your journey...");

        // Only allow if selected pokemon exists
        if (!player.selected.length || !player.selected[pokemonSlot]) return await msg.reply("You do not have a Pokemon selected...");

        // Fetch Pokemon
        const pokemon = new Pokedex({ id: player.selected[pokemonSlot] });

        // Fetch Pokemon
        await pokemon.fetchPokemon(msg.client.postgres);

        // MoveID
        const moveID = msg.options.getInteger("move-id");

        // TM-ID
        const TMID = msg.options.getInteger("tm-id");

        // MoveSlot
        const moveSlot = msg.options.getInteger("move-slot");

        // Get Pokemon's Moves
        const moves = pokemon.returnMoves();

        // Grab All Moves
        const allMoves = await pokemon.fetchAllMoves();

        // Retrieve Level Moves
        const availableMoves = allMoves.filter(x => x.move_method == "level-up");

        // Retrieve TM moves
        const tmAvailableMoves = allMoves.filter(x => x.move_method == "machine");

        // Retrieve TM prices
        await pokemon.fetchTMPrices();

        // For Level-Moves 
        if (moveSlot && moveID) {
            // Find Move
            const selectedMove = availableMoves.find(x => x.id == moveID);
            // Return Non-Existent Move
            if (!selectedMove) return await msg.reply("Cannot learn that...");
            // Disallow if Level does not allow
            if (selectedMove.level && pokemon.level < selectedMove.level) return await msg.reply("Your pokemon needs to be at least Level " + selectedMove.level + " to learn that move...");
            // Apply Move
            pokemon.save(msg.client.postgres, { ["m_" + moveSlot]: selectedMove.id_name });
            // Output
            return await msg.reply(`Your ${capitalize(pokemon.pokemon)} successfully learnt ${selectedMove.name}!`);
        }

        // For TM-Moves 
        if (moveSlot && TMID) {
            // Find Move
            const selectedMove = tmAvailableMoves.find(x => x.id == TMID);
            // Return Non-Existent Move
            if (!selectedMove) return await msg.reply("Cannot learn that...");
            // Find Cost
            const cost = pokemon.pokedex.move_prices.find(h => h.move_id == TMID).cost || 0;
            // Disallow if Level does not allow
            if (cost && cost > player.bal) return await msg.reply("You do not have enough funds for that move...");
            // Apply Move
            await pokemon.save(msg.client.postgres, { ["m_" + moveSlot]: selectedMove.id_name });
            // Reduce Player's Bal
            await player.save(msg.client.postgres, { bal: player.bal - cost });
            // Output
            return await msg.reply(`Your ${capitalize(pokemon.pokemon)} successfully learnt ${selectedMove.name}! ${cost.toLocaleString()} pokedits were deducted from your balance.`);
        }

        await msg.reply({
            embeds: [
                // Current Moves Embed
                {
                    color: Color("#ffeb3b").rgbNumber(),
                    title: `Current Moves of your Level ${pokemon.level} ${capitalize(pokemon.pokemon)}`,
                    description: `In order to set a move, please \`/moves store <move-id> <move-slot>\` and to check the available moves, use \`/moves info level-moves:true\``,
                    fields: [{
                        name: "Current Moves",
                        value: moves.map((x, i) => `**Move ${i + 1}**: ${capitalize(x.name.replace(/-/gim, " "))}\n`).join(""),
                        inline: false
                    }],
                    // Adding Professor Kukui
                    author: {
                        icon_url: "https://cdn.discordapp.com/attachments/738221731897933844/786154409498378270/Cutie.png",
                        name: `Professor Kukui`
                    }
                },
                // Level Moves Embed
                msg.options.getBoolean("level-moves") ? {
                    color: Color("#3f50b5").rgbNumber(),
                    title: `Level-Based moves for your Level ${pokemon.level} ${capitalize(pokemon.pokemon)}`,
                    description: `In order to set a move, please \`/moves store <move-id> <move-slot>\` and to check the available moves, use \`/moves info level-moves:true\``,
                    fields:
                        // Available Moves - By Leveling Up
                        availableMoves ? separateArray(availableMoves, 20).map(x => ({
                            name: "Available Moves",
                            inline: true,
                            value: x.map(y => y.name + ` | **Lvl**: ${y.level}+ | **ID**: \`${y.id}\`\n`).join("")
                        })) : [{
                            name: "Available Moves",
                            inline: true,
                            value: "-- None --"
                        }],
                    // Adding Professor Kukui
                    author: {
                        icon_url: "https://cdn.discordapp.com/attachments/738221731897933844/786154409498378270/Cutie.png",
                        name: `Professor Kukui`
                    }
                } : undefined,
                // TM Moves Embed
                msg.options.getBoolean("tm-moves") ? {
                    color: Color('#f44336').rgbNumber(),
                    title: `TM Moves for your Level ${pokemon.level} ${capitalize(pokemon.pokemon)}`,
                    description: `In order to set a move, please \`/moves store <move-id> <move-slot>\` and to check the available moves, use \`/moves info level-moves:true\``,
                    fields: [                    // Available Moves - By TMs
                        ...(tmAvailableMoves ? separateArray(tmAvailableMoves, 20).map(x => ({
                            name: "Available TM Moves",
                            inline: true,
                            value: x.map(y => y.name + ` | **Cost**: \`${(pokemon.pokedex.move_prices.find(h => h.move_id == y.id)?.cost || 0).toLocaleString()}\` | **ID**: \`${y.id}\`\n`).join("")
                        })) : [{
                            name: "Available TM Moves",
                            inline: true,
                            value: "-- None --"
                        }])
                    ],
                    // Adding Professor Kukui
                    author: {
                        icon_url: "https://cdn.discordapp.com/attachments/738221731897933844/786154409498378270/Cutie.png",
                        name: `Professor Kukui`
                    }
                } : undefined
            ].filter(x => x)
        });
    }
}
