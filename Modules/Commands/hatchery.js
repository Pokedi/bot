import { SlashCommandBuilder } from "discord.js";
import generateHatchery from "../../Utilities/Pokemon/generateHatchery.js";
import Player from "../../Classes/player.js";
import randomint from "../../Utilities/Misc/randomint.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('hatchery')
        .setNameLocalizations({
            'pt-BR': 'chocadeira',
            'es-ES': 'incubadora',
            'de': 'brüterei',
            'fr': 'écloserie',
            'ar': 'حضانة'
        })
        .setDescription('Incubate your eggs, and see what mysteries hide behind them')
        .setDescriptionLocalizations({
            'pt-BR': 'Incube seus ovos e veja que mistérios se escondem por trás deles',
            'es-ES': 'Incuba tus huevos y mira qué misterios se esconden detrás de ellos',
            'de': 'Brüte deine Eier aus und sieh, welche Geheimnisse sich dahinter verbergen',
            'fr': 'Incubez vos œufs et voyez quels mystères se cachent derrière eux',
            'ar': 'احتضن بيضك ، وانظر ما هي الألغاز التي تختبئ وراءها'
        })
        .addSubcommand(x => x
            .setName("view")
            .setNameLocalizations({
                'pt-BR': 'ver',
                'es-ES': 'ver',
                'de': 'ansehen',
                'fr': 'voir',
                'ar': 'عرض'
            })
            .setDescription("View your hatchery")
            .setDescriptionLocalizations({
                'pt-BR': 'Veja sua chocadeira',
                'es-ES': 'Ver tu incubadora',
                'de': 'Sieh dir deine Brüterei an',
                'fr': 'Voir votre écloserie',
                'ar': 'عرض حضانتك'
            })
            .addIntegerOption(z => z.setName("slot").setDescription("Monitor the slot of your Egg").setMaxValue(4).setMinValue(1)
                .setNameLocalizations({
                    'pt-BR': 'ninho',
                    'es-ES': 'ranura',
                    'de': 'steckplatz',
                    'fr': 'emplacement',
                    'ar': 'فتحة'
                })
                .setDescriptionLocalizations({
                    'pt-BR': 'Monitore o ninho do seu Ovo',
                    'es-ES': 'Monitorea la ranura de tu Huevo',
                    'de': 'Überwache den Steckplatz deines Eies',
                    'fr': 'Surveillez l\'emplacement de votre Oeuf',
                    'ar': 'مراقبة فتحة بيضتك'
                }))
        )
        .addSubcommand(x => x
            .setName("set")
            .setNameLocalizations({
                'pt-BR': 'definir',
                'es-ES': 'establecer',
                'de': 'einstellen',
                'fr': 'définir',
                'ar': 'تعيين'
            })
            .setDescription("Set the Egg to keep close in your journey")
            .setDescriptionLocalizations({
                'pt-BR': 'Defina o Ovo para manter perto em sua jornada',
                'es-ES': 'Establece el Huevo para mantenerlo cerca en tu viaje',
                'de': 'Stelle das Ei so ein, dass es auf deiner Reise in deiner Nähe bleibt',
                'fr': 'Définissez l\'Oeuf à garder près de vous pendant votre voyage',
                'ar': 'ضع البيضة لتبقى قريبة في رحلتك'
            })
            .addIntegerOption(z => z.setName("egg-id").setDescription("The ID of the Egg you wish to add to the Slot").setRequired(true)
                .setNameLocalizations({
                    'pt-BR': 'id-ovo',
                    'es-ES': 'id-huevo',
                    'de': 'ei-id',
                    'fr': 'id-oeuf',
                    'ar': 'معرف-البيضة'
                })
                .setDescriptionLocalizations({
                    'pt-BR': 'O ID do Ovo que você deseja adicionar ao Ninho',
                    'es-ES': 'El ID del Huevo que deseas agregar a la Ranura',
                    'de': 'Die ID des Eies, das du zum Steckplatz hinzufügen möchtest',
                    'fr': "L'ID de l'Oeuf que vous souhaitez ajouter à l'Emplacement",
                    'ar': 'معرف البيضة الذي ترغب في إضافته إلى الفتحة'
                }))
            .addIntegerOption(z => z.setName("slot").setDescription("Set the slot of your Egg").setMaxValue(4).setMinValue(1)
                .setNameLocalizations({
                    'pt-BR': 'ninho',
                    'es-ES': 'ranura',
                    'de': 'steckplatz',
                    'fr': 'emplacement',
                    'ar': 'فتحة'
                })
                .setDescriptionLocalizations({
                    'pt-BR': 'Defina o ninho do seu Ovo',
                    'es-ES': 'Establece la ranura de tu Huevo',
                    'de': 'Stelle den Steckplatz deines Eies ein',
                    'fr': 'Définir l\'emplacement de votre Oeuf',
                    'ar': 'تعيين فتحة بيضتك'
                }))
        )
        .addSubcommand(x => x
            .setName("unset")
            .setNameLocalizations({
                'pt-BR': 'remover',
                'es-ES': 'quitar',
                'de': 'entfernen',
                'fr': 'retirer',
                'ar': 'إزالة'
            })
            .setDescription("Remove an Egg from its Nest [Progress is Reset]")
            .setDescriptionLocalizations({
                'pt-BR': 'Remova um Ovo do seu Ninho [O progresso é reiniciado]',
                'es-ES': 'Quita un Huevo de su Nido [El progreso se reinicia]',
                'de': 'Entferne ein Ei aus seinem Nest [Fortschritt wird zurückgesetzt]',
                'fr': 'Retirez un Oeuf de son Nid [La progression est réinitialisée]',
                'ar': 'إزالة بيضة من عشها [يتم إعادة تعيين التقدم]'
            })
            .addIntegerOption(z => z.setName("slot").setDescription("Nest you wish to remove the egg from.").setMaxValue(4).setMinValue(1).setRequired(true)
                .setNameLocalizations({
                    'pt-BR': 'ninho',
                    'es-ES': 'nido',
                    'de': 'nest',
                    'fr': 'nid',
                    'ar': 'عش'
                })
                .setDescriptionLocalizations({
                    'pt-BR': 'Ninho do qual você deseja remover o ovo.',
                    'es-ES': 'Nido del que deseas quitar el huevo.',
                    'de': 'Nest, aus dem du das Ei entfernen möchtest.',
                    'fr': 'Nid duquel vous souhaitez retirer l\'œuf.',
                    'ar': 'العش الذي ترغب في إزالة البيضة منه.'
                }))
        )
        .addSubcommand(x => x
            .setName("shop")
            .setNameLocalizations({
                'pt-BR': 'loja',
                'es-ES': 'tienda',
                'de': 'laden',
                'fr': 'boutique',
                'ar': 'متجر'
            })
            .setDescription("Buy available Slots")
            .setDescriptionLocalizations({
                'pt-BR': 'Compre Ninhos disponíveis',
                'es-ES': 'Comprar Ranuras disponibles',
                'de': 'Kaufe verfügbare Steckplätze',
                'fr': 'Acheter des Emplacements disponibles',
                'ar': 'شراء فتحات متاحة'
            })
            .addBooleanOption(z => z.setName("first-slot").setDescription("Buy your first Slot if you haven't already!")
                .setNameLocalizations({
                    'pt-BR': 'primeiro-ninho',
                    'es-ES': 'primera-ranura',
                    'de': 'erster-steckplatz',
                    'fr': 'premier-emplacement',
                    'ar': 'الفتحة-الأولى'
                })
                .setDescriptionLocalizations({
                    'pt-BR': 'Compre seu primeiro Ninho se ainda não o fez!',
                    'es-ES': '¡Compra tu primera Ranura si aún no lo has hecho!',
                    'de': 'Kaufe deinen ersten Steckplatz, wenn du es noch nicht getan hast!',
                    'fr': 'Achetez votre premier Emplacement si vous ne l\'avez pas déjà fait!',
                    'ar': 'اشترِ فتحتك الأولى إذا لم تكن قد فعلت ذلك بالفعل!'
                }))
        )
        .addSubcommand(x => x
            .setName("help")
            .setNameLocalizations({
                'pt-BR': 'ajuda',
                'es-ES': 'ayuda',
                'de': 'hilfe',
                'fr': 'aide',
                'ar': 'مساعدة'
            })
            .setDescription("View the helpful information of this command")
            .setDescriptionLocalizations({
                'pt-BR': 'Veja as informações úteis deste comando',
                'es-ES': 'Ver la información útil de este comando',
                'de': 'Sieh dir die hilfreichen Informationen dieses Befehls an',
                'fr': 'Voir les informations utiles de cette commande',
                'ar': 'عرض المعلومات المفيدة لهذا الأمر'
            })
        ),
    async execute(msg) {

        if (msg.options.getSubcommand() == "help")
            return msg.options._hoistedOptions.push({ name: "command_name", type: 3, value: "hatchery" }),
                msg.client.commands.get("help")(msg);

        // Prepare Slot
        let slot = msg.options.getInteger("slot") || 0;

        // Check Player
        const player = new Player({ id: msg.user.id });

        // Fetch Columns
        await player.fetchColumns(msg.client.postgres, "started, bal");

        if (!player.started)
            return msg.reply("You have not started your adventure");

        // Ready Hatchery
        const hatchery = await player.fetchHatchery(msg.client.postgres);

        // Check if User wishes to Set an Egg to its Slot
        if (msg.options.getSubcommand() == "set") {

            const eggID = msg.options.getInteger("egg-id");

            const foundSlot = (hatchery.find(x => x.slot == (slot || 1)));

            if (!foundSlot)
                return msg.reply("Sorry but that nest is currently unavailable");

            const [foundEgg] = await msg.client.postgres`SELECT id FROM pokemon WHERE idx = ${eggID} AND user_id = ${player.id} AND pokemon = 'egg'`;

            if (!foundEgg)
                return msg.reply("Sorry but that either isn't an egg or doesn't exist at all");

            await msg.client.postgres`UPDATE hatchery SET egg_id = ${foundEgg.id}, count = ${1000 + randomint(3000)} WHERE slot = ${slot || 1} AND user_id = ${player.id}`;

            if (msg.user.player)
                msg.user.player.hatchery = await player.fetchHatchery(msg.client.postgres);

            return msg.reply(`Egg #\`${eggID}\` was successfully set to Nest #${slot || 1}`)

        } else if (msg.options.getSubcommand() == "unset") {

            const [row] = await msg.client.postgres`UPDATE hatchery SET egg_id = null, count = 0 WHERE slot = ${slot || 1} AND user_id = ${player.id} returning id`;

            if (!row)
                return msg.reply("You did not have an egg there to begin with...");

            return msg.reply("Successfully removed the egg from the nest... The sky is turning dark all of a sudden.");

        }

        // Check if User wants to buy a Nest
        if (msg.options.getBoolean("first-slot")) {

            // Reject if already bought
            if (hatchery.length)
                return msg.reply("You already have a Nest ready for you!");

            if (player.bal < 5000)
                return msg.reply("You do not have enough money to support a family yet. You require 5000c at least.");

            const result = await msg.client.postgres.begin(sql => [
                sql`UPDATE users SET bal = bal - 5000 WHERE id = ${msg.user.id}`,
                sql`INSERT INTO hatchery ${sql({
                    user_id: msg.user.id,
                    slot: 1,
                    timestamp: new Date()
                })}`
            ]);

            if (result)
                return msg.reply("The first nest suddenly feels warmer...");

            return msg.reply("Failed to warm nest");
        }

        // Return if User wishes to see Hatchery
        if (!slot)
            msg.reply({
                files: [{
                    attachment: await generateHatchery(hatchery.map(x => x.slot)),
                    name: "hatchery.png"
                }],
                embeds: [{
                    color: 14861714,
                    title: "Let's see how everyone's doing... ♥",
                    image: {
                        url: "attachment://hatchery.png"
                    }
                }]
            });

        if (slot) {
            const foundSlot = (hatchery.find(x => x.slot == (slot || 1)));

            let slotImage = "empty-nest";

            if (foundSlot && foundSlot.egg_id)
                if (foundSlot.count <= 200)
                    slotImage = "hatch-nest";
                else
                    slotImage = "egg-nest";

            return msg.reply({
                files: [{
                    attachment: "../pokediAssets/hatchery/" + slotImage + ".jpg",
                    name: "nest.png"
                }],
                embeds: [{
                    color: 5002313,
                    title: "Nest #" + (slot || 1),
                    description: foundSlot ? (foundSlot.egg_id ? "Someone seems eagerly to coming out!" : "A warm bed, waiting for someone to rest!") : "An empty home... waiting for someone to return to...",
                    image: {
                        url: "attachment://nest.png"
                    },
                    footer: {
                        text: foundSlot && foundSlot.idx ? `EggID: ${foundSlot.idx}` : "One makes a soul, two make a pair, three make a family."
                    }
                }]
            })
        }
    }
};
