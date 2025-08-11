import { SlashCommandBuilder } from "discord.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('start').setNameLocalizations({
            "es-ES": "empezar",
            "pt-BR": "iniciar",
            "de": "start",
            "fr": "démarrer",
            // "ar": "ابدأ"
        })
        .setDescription('Start your journey!')
        .setDescriptionLocalizations({
            'pt-BR': 'Comece sua jornada!',
            'es-ES': '¡Comienza tu viaje!',
            'de': 'Beginne deine Reise!',
            'fr': 'Commencez votre voyage!',
            // 'ar': 'ابدأ رحلتك!'
        }),
    async execute(msg) {
        return msg.reply({
            embeds: [{
                image: {
                    url: "https://i.imgur.com/YgGIVf6.png"
                },
                title: `Hello ${msg.user.username}`,
                description: `**Welcome to the world of pokémon!**
                To begin playing, choose one of these pokémon with the \`/pick <pokemon>\` command

• **Generation I** •
Bulbasaur | Charmander | Squirtle

• **Generation II** •
Chikorita | Cyndaquil | Totodile

• **Generation III** •
Treecko | Torchic | Mudkip

• **Generation IV** •
Turtwig | Chimchar | Piplup

• **Generation V** •
Snivy | Tepig | Oshawott

• **Generation VI** •
Chespin | Fennekin | Froakie

• **Generation VII** •
Rowlet | Litten | Popplio

• **Generation VIII** •
Grookey | Scorbunny | Sobble

• **Misc:** •
Eevee | Pikachu
`,
                color: 44678,
                footer: {
                    text: `Example: /pick charmander`
                }
            }]
        }).catch(() => {
        }
        );
    }
}
