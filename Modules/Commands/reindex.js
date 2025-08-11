import { SlashCommandBuilder } from "discord.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('reindex')
        .setNameLocalizations({
            'pt-BR': 'reindexar',
            'es-ES': 'reindexar',
            'de': 'neuindizieren',
            'fr': 'réindexer',
            // 'ar': 'إعادة-الفهرسة'
        })
        .setDescription('Index your Pokemon')
        .setDescriptionLocalizations({
            'pt-BR': 'Indexe seu Pokémon',
            'es-ES': 'Indexa tu Pokémon',
            'de': 'Indiziere dein Pokémon',
            'fr': 'Indexez votre Pokémon',
            // 'ar': 'فهرسة بوكيمونك'
        }),
    async execute(msg) {

        // TODO:
        // Move this all to Server to handle 
        if (msg.user.reindex && Date.now() - msg.user.reindex < (1000 * 60 * 60)) return msg.reply("Please wait until you can use this command again...");

        const sentMessage = await msg.reply("Fetching Pokemon... 25%");

        const postgres = msg.client.postgres;

        const userPokemon = await postgres`SELECT id FROM pokemon WHERE user_id = ${msg.user.id} ORDER BY id ASC;`;

        await sentMessage.edit("Clearing Pokemon indexes... 50%");

        await postgres`UPDATE pokemon SET idx = 0 WHERE user_id = ${msg.user.id}`;

        await sentMessage.edit("Reindexing Pokemon... 75%");

        try {
            let i = 1;

            await msg.client.postgres.begin(sql => userPokemon.map(x => sql`UPDATE pokemon SET idx = ${i++} WHERE id = ${x.id}`));

            await sentMessage.edit("Completed indexing all Pokemon!");
        } catch (error) {
            await sentMessage.edit("An error occurred. Please try again later.");
            console.log(error);
        }

        msg.user.reindex = Date.now();

    }
};