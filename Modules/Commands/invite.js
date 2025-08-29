import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import i18n from "i18n";

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
        
    mention_support: true,

    async execute(msg) {
        const inviteEmbed = new EmbedBuilder()
            .setTitle(i18n.__('commands.invite.title'))
            .setDescription(i18n.__('commands.invite.description'))
            .setURL('https://pokedi.xyz/invite')
            .setColor('#349EEB')
            .setFooter({ text: i18n.__('commands.invite.footer') })
            .setImage('https://pokedi.xyz/images/banner.png')
            .setTimestamp();

        msg.reply({ embeds: [inviteEmbed] });
    }
}
