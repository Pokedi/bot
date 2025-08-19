import { SlashCommandBuilder } from "discord.js";
import generateProfile from "../../Utilities/User/generateProfile.js";
import Player from "../../Classes/player.js";
import getDominantColor from "../../Utilities/Misc/getDominantColor.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('profile')
        .setNameLocalizations({
            'pt-BR': 'perfil',
            'es-ES': 'perfil',
            'de': 'profil',
            'fr': 'profil',
            // 'ar': 'الملف-الشخصي'
        })
        .setDescription('Flex your awesome profile and even customize it!')
        .setDescriptionLocalizations({
            'pt-BR': 'Mostre seu perfil incrível e até personalize-o!',
            'es-ES': '¡Muestra tu increíble perfil e incluso personalízalo!',
            'de': 'Zeige dein fantastisches Profil und passe es sogar an!',
            'fr': 'Affichez votre profil génial et personnalisez-le même!',
            // 'ar': 'استعرض ملفك الشخصي الرائع وقم بتخصيص!'
        })
        .addSubcommand(x => x
            .setName("view")
            .setNameLocalizations({
                'pt-BR': 'ver',
                'es-ES': 'ver',
                'de': 'ansehen',
                'fr': 'voir',
                // 'ar': 'عرض'
            })
            .setDescription("See your current Profile")
            .setDescriptionLocalizations({
                'pt-BR': 'Veja seu perfil atual',
                'es-ES': 'Ver tu perfil actual',
                'de': 'Sieh dir dein aktuelles Profil an',
                'fr': 'Voir votre profil actuel',
                // 'ar': 'عرض ملفك الشخصي الحالي'
            })
        )
        .addSubcommand(x => x
            .setName("start")
            .setNameLocalizations({
                'pt-BR': 'iniciar',
                'es-ES': 'iniciar',
                'de': 'start',
                'fr': 'démarrer',
                // 'ar': 'ابدأ'
            })
            .setDescription("Be sure to fill up all the required options to start your adventure!")
            .setDescriptionLocalizations({
                'pt-BR': 'Certifique-se de preencher todas as opções necessárias para iniciar sua aventura!',
                'es-ES': '¡Asegúrate de completar todas las opciones requeridas para comenzar tu aventura!',
                'de': 'Stelle sicher, dass du alle erforderlichen Optionen ausfüllst, um dein Abenteuer zu beginnen!',
                'fr': 'Assurez-vous de remplir toutes les options requises pour commencer votre aventure!',
                // 'ar': 'تأكد من ملء جميع الخيارات المطلوبة لبدء مغامرتك!'
            })
            .addIntegerOption(y => y
                .setRequired(true)
                .setName("character")
                .setNameLocalizations({
                    'pt-BR': 'personagem',
                    'es-ES': 'personaje',
                    'de': 'charakter',
                    'fr': 'personnage',
                    // 'ar': 'شخصية'
                })
                .setDescription("Select the character you connect to most!")
                .setDescriptionLocalizations({
                    'pt-BR': 'Selecione o personagem com o qual você mais se conecta!',
                    'es-ES': '¡Selecciona el personaje con el que más te conectas!',
                    'de': 'Wähle den Charakter aus, mit dem du dich am meisten verbunden fühlst!',
                    'fr': 'Sélectionnez le personnage auquel vous vous connectez le plus!',
                    // 'ar': 'اختر الشخصية التي تتواصل معها أكثر!'
                })
                .addChoices({
                    "name": "Red",
                    "value": 1
                }, {
                    "name": "Victor",
                    "value": 2
                }, {
                    "name": "Blue",
                    "value": 3
                }, {
                    "name": "Dawn",
                    "value": 4
                }, {
                    "name": "Leaf",
                    "value": 5
                }, {
                    "name": "Ethan",
                    "value": 6
                }, {
                    "name": "Brendan",
                    "value": 7
                }, {
                    "name": "May",
                    "value": 8
                }, {
                    "name": "Elio",
                    "value": 9
                })
            )
            .addStringOption(y => y
                .setName("gender")
                .setNameLocalizations({
                    'pt-BR': 'genero',
                    'es-ES': 'genero',
                    'de': 'geschlecht',
                    'fr': 'genre',
                    // 'ar': 'الجنس'
                })
                .setDescription("Are you a boy or a girl? ~ (Professor Oak)")
                .setDescriptionLocalizations({
                    'pt-BR': 'Você é um menino ou uma menina? ~ (Professor Carvalho)',
                    'es-ES': '¿Eres un niño o una niña? ~ (Profesor Oak)',
                    'de': 'Bist du ein Junge oder ein Mädchen? ~ (Professor Eich)',
                    'fr': 'Êtes-vous un garçon ou une fille? ~ (Professeur Chen)',
                    // 'ar': 'هل أنت فتى أم فتاة؟ ~ (البروفيسور أوك)'
                })
                .addChoices({
                    name: "Male",
                    value: "male"
                }, {
                    name: "Female",
                    value: "female"
                }, {
                    name: "Undisclosed",
                    value: "undisclosed"
                })
                .setRequired(true)
            )
        )
        .addSubcommand(x => x
            .setName("listing")
            .setNameLocalizations({
                'pt-BR': 'listagem',
                'es-ES': 'listado',
                'de': 'auflistung',
                'fr': 'liste',
                // 'ar': 'قائمة'
            })
            .setDescription("See the available character options")
            .setDescriptionLocalizations({
                'pt-BR': 'Veja as opções de personagens disponíveis',
                'es-ES': 'Ver las opciones de personajes disponibles',
                'de': 'Sieh dir die verfügbaren Charakteroptionen an',
                'fr': 'Voir les options de personnages disponibles',
                // 'ar': 'عرض خيارات الشخصيات المتاحة'
            }))
        .addSubcommand(x => x
            .setName("help")
            .setNameLocalizations({
                'pt-BR': 'ajuda',
                'es-ES': 'ayuda',
                'de': 'hilfe',
                'fr': 'aide',
                // 'ar': 'مساعدة'
            })
            .setDescription("Learn how to use the Profile Command and make the most of customizing your profile!")
            .setDescriptionLocalizations({
                'pt-BR': 'Aprenda a usar o Comando de Perfil e aproveite ao máximo para personalizar seu perfil!',
                'es-ES': 'Aprende a usar el Comando de Perfil y sácale el máximo provecho a la personalización de tu perfil',
                'de': 'Erfahre, wie du den Profil-Befehl nutzt und das Beste aus der Anpassung deines Profils herausholst!',
                'fr': 'Apprenez à utiliser la commande Profil et profitez pleinement de la personnalisation de votre profil',
                // 'ar': 'تعلم كيفية استخدام أمر الملف الشخصي والاستفادة القصوى من تخصيص ملفك!'
            })
        ),
    async execute(msg) {

        const subCommand = msg.options.getSubcommand();

        switch (subCommand) {
            case "help":
                return msg.options._hoistedOptions.push({ name: "command_name", type: 3, value: "moves" }),
                    msg.client.commands.get("help")(msg);

            case "listing": {
                return await msg.reply({
                    embeds: [{
                        title: "Use the following character code for the start function when needed.",
                        image: {
                            url: "https://i.imgur.com/CqawkU5.png"
                        }
                    }]
                });
            }

            case "start": {

                const player = new Player({ id: msg.user.id });

                await player.fetch(msg.client.postgres);

                if (!player.started) return await msg.reply("Please make sure to /pick a pokemon!");
                if (player.character) return await msg.reply("You already started your adventure");

                return await msg.client.postgres`UPDATE users SET background = 1, character = ${msg.options.getInteger("character")}, gender = ${msg.options.getString("gender")} WHERE id = ${msg.user.id}`,
                    await msg.reply("Your profile has been created! Use /profile to see it.");
            }

            default: {

                const player = new Player({ id: msg.user.id });

                await player.fetch(msg.client.postgres);

                if (!player.started) return await msg.reply("Please make sure to /pick a pokemon!");

                if (!player.selected)
                    return await msg.reply("Please select a Pokemon to load with you!");

                const profileMessage = await msg.reply({ content: "Please wait...", withResponse: true });

                const profileImage = await generateProfile(msg.client.postgres, player, msg.user.globalName || msg.user.username);

                if (!profileImage) return await msg.reply("Profile could not be created. Maybe a Pokemon was not selected?");

                return await profileMessage.resource.message.edit({
                    content: null,
                    files: [{
                        attachment: profileImage,
                        name: "profile.png"
                    }],
                    embeds: [{
                        color: await getDominantColor(`../pokediAssets/profile/backgrounds/${player.background || "1"}.png`, true),
                        image: {
                            url: "attachment://profile.png"
                        },
                    }]
                });
            }
        }
    }
}
