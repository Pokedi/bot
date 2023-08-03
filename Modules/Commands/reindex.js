import { SlashCommandBuilder } from "discord.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('reindex')
        .setDescription('Index your Pokemon'),
    async execute(msg) {

        // TODO:
        // Move this all to Server to handle 

        if (msg.user.reindex && Date.now() - msg.user.reindex < (1000 * 60 * 60)) return msg.reply("Please wait until you can use this command again...");

        const sentMessage = await msg.reply("Fetching Pokemon... 25%");

        const prisma = msg.client.prisma;

        const userPokemon = await prisma.pokemon.findMany({ where: { user_id: BigInt(msg.user.id) } }, {
            select: {
                id: true
            }
        });

        await sentMessage.edit("Clearing Pokemon indexes... 50%");

        await prisma.pokemon.updateMany({
            where: {
                user_id: BigInt(msg.user.id)
            },
            data: {
                idx: 0
            }
        });

        await sentMessage.edit("Reindexing Pokemon... 75%");

        try {
            let i = 0;

            await msg.client.postgres.begin(sql => userPokemon.map(x => sql`UPDATE pokemon SET idx = ${i++} WHERE id = ${x.id}`));

            await sentMessage.edit("Completed indexing all Pokemon!");
        } catch (error) {
            await sentMessage.edit("An error occurred. Please try again later.");
            console.log(error);
        }

        msg.user.reindex = Date.now();

    }
};