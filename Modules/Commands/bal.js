import i18n from "i18n";

import { SlashCommandBuilder } from "discord.js";
import commalize from "../../Utilities/Misc/commalize.js";
import Player from "../../Classes/player.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('bal').setNameLocalizations({
            'pt-BR': "saldo",
            "es-ES": "saldo",
            "de": "konto",
            "fr": "solde",
            // "ar": "رصيد"
        })
        .setDescription('Check your credit balance.').setDescriptionLocalizations({
            'pt-BR': "Verifique seu saldo de créditos.",
            "es-ES": "Consulta tu saldo de créditos.",
            "de": "Überprüfen Sie Ihren Kontostand.",
            "fr": "Consultez votre solde de crédits.",
            // "ar": "تحقق من رصيد قروضك"
        }),
    aliases: ['balance', 'credits', 'credit'],
    async execute(msg) {

        const player = new Player({ id: msg.user.id, /* guild_id: msg.guild.info.mode ? msg.guild.id : null */ });

        const { bal, redeem } = await player.fetchIncome(msg.client.postgres);

        return await msg.reply({
            embeds: [{
                title: i18n.__('commands.bal.balance'),
                fields: [{
                    name: ((bal || 0) > 2e9 ? '<:lotsofmoney:812189965332381697>' : '💰') + " Credits", value: commalize((bal || 0))
                }, {
                    name: ((redeem || 0) > 50 ? "<:pikadrool:779316719021326347>" : '💸') + " Redeems", value: commalize((redeem || 0))
                }],
                thumbnail: {
                    url: "https://cdn.discordapp.com/attachments/718609436289007699/800415630066057226/image1.png"
                },
                color: 0x00ae86
            }]
        });
    }
};