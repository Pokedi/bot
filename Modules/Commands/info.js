import { SlashCommandBuilder } from "discord.js";
import Pokemon from "../../Classes/pokemon.js";
import userPokemonInfoModule from "../../Utilities/Pokemon/userPokemonInfoModule.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .addStringOption(option => option.setName('query').setDescription('Type in the ID of the pokemon. (You may type in "latest" for the last one)'))
        .setName('info')
        .setDescription('View your Pokemon!'),
    async execute(msg) {
        const content = (msg.options.getString("query") || "latest").toLowerCase();

        // isID?
        const isID = !isNaN(parseInt(content)) && parseInt(content);

        // Queries
        const selectedPokemon = await msg.client.prisma.pokemon.findFirst({
            where: content.includes("l") ? {
                user_id: BigInt(msg.user.id)
            } : {
                user_id: BigInt(msg.user.id),
                idx: parseInt(content)
            },
            orderBy: {
                id: "desc"
            },
            take: 1,
            skip: isID && parseInt(content) < 0 ? -1 * parseInt(content) : 0
        });

        let processedPokemon = new Pokemon(selectedPokemon);

        if (!processedPokemon.id)
            return msg.reply("pokemon does not exist.");

        msg.reply({ embeds: [userPokemonInfoModule(processedPokemon, processedPokemon.getDetails())] });
    }
}
