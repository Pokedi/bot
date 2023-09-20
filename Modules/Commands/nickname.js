import { SlashCommandBuilder } from "discord.js";
import Pokemon from "../../Classes/pokemon.js";
import capitalize from "../../Utilities/Misc/capitalize.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('nickname')
        .setDescription('Rename your Pokemon! Call it by something other than its species (you racist)')
        .addIntegerOption(option => option.setName('id').setRequired(true).setDescription('Type in the ID of the pokemon'))
        .addStringOption(option => option.setName('new-name').setDescription('Type in the new name of the pokemon').setMaxLength(50))
        .addBooleanOption(option => option.setName('reset').setDescription('Select this if you wish to reset your pokemon name')),
    async execute(msg) {

        const pokemonID = msg.options.getInteger('id');

        const setName = msg.options.getString('new-name') || "";

        const resetPokemon = msg.options.getBoolean('reset');

        const queryPokemon = new Pokemon(await msg.client.prisma.pokemon.findFirst({
            where: {
                idx: pokemonID,
                user_id: BigInt(msg.user.id)
            }
        }));

        if (!queryPokemon.pokemon) return await msg.reply("Pokemon of that ID does not exist.");

        if (resetPokemon) queryPokemon.name = null;

        if (setName) queryPokemon.name = setName;

        try {
            await queryPokemon.save(msg.client.postgres);

            await msg.reply(`Your ${capitalize(queryPokemon.pokemon)} (${queryPokemon.idx}) was updated.`);

        } catch (error) {
            await msg.reply("An error occurred, contact an admin");
        }

    }
}
