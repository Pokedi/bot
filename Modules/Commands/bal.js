const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    help: "",
    data: new SlashCommandBuilder()
        .setName('bal').setNameLocalizations({
            'pt-BR': "saldo",
            "es-ES": "saldo",
            "de": "konto"
        })
        .setDescription('Check your credit balance.'),
    aliases: ['balance', 'credits', 'credit'],
    async function(msg) {
        const bal = 2000;
        const redeem = 200;
        msg.reply({
            embeds: [{
                title: "Currently being Made!",
                fields: [{
                    name: ((bal || 0) > 2e9 ? '<:lotsofmoney:812189965332381697>' : '💰') + " Credits", value: (bal || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }, { name: ((redeem || 0) > 50 ? "<:pikadrool:779316719021326347>" : '💸') + " Redeems", value: redeem || "0" }],
                thumbnail: {
                    url: "https://cdn.discordapp.com/attachments/718609436289007699/800415630066057226/image1.png"
                },
                color: 0x00ae86
            }]
        });
    }
}