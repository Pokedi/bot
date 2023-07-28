import { SlashCommandBuilder } from "discord.js";
import commalize from "../../Utilities/Misc/commalize.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('bal').setNameLocalizations({
            'pt-BR': "saldo",
            "es-ES": "saldo",
            "de": "konto"
        })
        .setDescription('Check your credit balance.'),
    aliases: ['balance', 'credits', 'credit'],
    async execute(msg) {
        const { bal, redeem } = await msg.client.prisma.users.findUnique({ where: { id: BigInt(msg.user.id) } }, {
            select: {
                bal: true,
                redeem: true,
            }
        }) || {};
        return await msg.reply({
            embeds: [{
                title: "Your Balance",
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