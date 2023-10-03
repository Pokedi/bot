import { SlashCommandBuilder } from "discord.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('order').setNameLocalizations({
            "es-ES": "orden",
            "pt-BR": "ordenar",
            "de": "reihenfolge"
        })
        .setDescription('Select how you want to order your pokemon in the list')
        .addStringOption(option => option.setName('style').setDescription('Select how you want your pokemon ordered').setRequired(true)
            .addChoices({ name: 'Number', value: 'idx' },
                { name: 'IV', value: 'iv' },
                { name: 'Alphabetically', value: 'a' },
                { name: 'Level', value: 'l' })
        )
        .addStringOption(option => option.setName("order").setDescription("Select whether you want the order to be ascending or descending").setRequired(true).addChoices({
            name: "Ascending", value: "asc"
        }, {
            name: "Descending", value: "desc"
        })),
    async execute(msg) {

        let orderType = msg.options.getString("style"),
            orderFlow = msg.options.getString("order");

        await msg.client.postgres`UPDATE users SET order_by = ${`${orderType}-${orderFlow}`} WHERE id = ${msg.user.id}`

        await msg.reply("Order was updated!");

    }
}

