import { SlashCommandBuilder } from "discord.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('invite')
        .setNameLocalizations({
            'pt-BR': 'convidar',
            'es-ES': 'invitar',
            'de': 'einladen',
            'fr': 'inviter',
            // 'ar': 'دعوة'
        })
        .setDescription('Invite Pokedi to share the fun with your friends!')
        .setDescriptionLocalizations({
            'pt-BR': 'Convide o Pokedi para compartilhar a diversão com seus amigos!',
            'es-ES': '¡Invita a Pokedi a compartir la diversión con tus amigos!',
            'de': 'Lade Pokedi ein, um den Spaß mit deinen Freunden zu teilen!',
            'fr': 'Invitez Pokedi à partager le plaisir avec vos amis!',
            // 'ar': 'ادعُ بوكيدي لمشاركة المرح مع أصدقائك!'
        }),
    async execute(msg) {
        msg.reply("Thank you for considering to [invite](https://pokedi.xyz/invite) Pokedi. If you have any questions, join our support server by clicking the [Discord](https://pokedi.xyz) link in our website.");
    }
}
