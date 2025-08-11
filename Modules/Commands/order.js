import { SlashCommandBuilder } from "discord.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('order').setNameLocalizations({
            "es-ES": "orden",
            "pt-BR": "ordenar",
            "de": "reihenfolge",
            "fr": "ordre",
            "ar": "ترتيب"
        })
        .setDescription('Select how you want to order your pokemon in the list')
        .setDescriptionLocalizations({
            'pt-BR': 'Selecione como você quer ordenar seus pokémon na lista',
            'es-ES': 'Selecciona cómo quieres ordenar tus pokemon en la lista',
            'de': 'Wähle aus, wie du deine Pokémon in der Liste ordnen möchtest',
            'fr': 'Sélectionnez comment vous voulez classer vos pokémon dans la liste',
            'ar': 'حدد كيف تريد ترتيب بوكيموناتك في القائمة'
        })
        .addStringOption(option => option.setName('style').setDescription('Select how you want your pokemon ordered').setRequired(true)
            .setNameLocalizations({
                'pt-BR': 'estilo',
                'es-ES': 'estilo',
                'de': 'stil',
                'fr': 'style',
                'ar': 'نمط'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'Selecione como você quer que seus pokemon sejam ordenados',
                'es-ES': 'Selecciona cómo quieres que se ordenen tus pokemon',
                'de': 'Wähle aus, wie deine Pokémon geordnet werden sollen',
                'fr': 'Sélectionnez comment vous voulez que vos pokemon soient classés',
                'ar': 'حدد كيف تريد ترتيب بوكيموناتك'
            })
            .addChoices({ name: 'Number', value: 'idx' },
                { name: 'IV', value: 'iv' },
                { name: 'Alphabetically', value: 'a' },
                { name: 'Level', value: 'l' })
        )
        .addStringOption(option => option.setName("order").setDescription("Select whether you want the order to be ascending or descending").setRequired(true)
            .setNameLocalizations({
                'pt-BR': 'ordem',
                'es-ES': 'orden',
                'de': 'reihenfolge',
                'fr': 'ordre',
                'ar': 'ترتيب'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'Selecione se você quer que a ordem seja ascendente ou descendente',
                'es-ES': 'Selecciona si quieres que el orden sea ascendente o descendente',
                'de': 'Wähle aus, ob die Reihenfolge aufsteigend oder absteigend sein soll',
                'fr': 'Sélectionnez si vous voulez que l\'ordre soit croissant ou décroissant',
                'ar': 'حدد ما إذا كنت تريد أن يكون الترتيب تصاعديًا أم تنازليًا'
            })
            .addChoices({
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

