import { SlashCommandBuilder } from "discord.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('vote')
        .setNameLocalizations({
            "es-ES": "votar",
            "pt-BR": "votar",
            "fr": "voter",
            "de": "abstimmen",
            "ar": "تصويت"
        })
        .setDescription('Vote for Pokedi to help Support it!')
        .setDescriptionLocalizations({
            "es-ES": "¡Vota por Pokedi para ayudar a apoyarlo!",
            "pt-BR": "Vote no Pokedi para ajudar a apoiá-lo!",
            "fr": "Votez pour Pokedi afin de l'aider à être soutenu !",
            "de": "Stimme für Pokedi ab, um es zu unterstützen!",
            "ar": "صوّت لـ Pokedi للمساعدة في دعمه!"
        }),
    async execute(msg) {
        msg.reply("Thank you for considering to [vote](https://pokedi.xyz/vote) for Pokedi. Any and all help will be greatly appreciated");
    }
}
