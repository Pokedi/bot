import { SlashCommandBuilder } from "discord.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('nickname')
        .addStringOption(option => option.setName('name').setDescription('Type in the new name of the pokemon'))
        .addIntegerOption(option => option.setName('id').setDescription('Type in the ID of the pokemon'))
        .addBooleanOption(option => option.setName('reset').setDescription('Select this if you wish to reset your pokemon name')),
    async execute(msg) {

        const pokemonID = msg.options.getNumber('id');

        const setName = msg.options.getString('name');

        const resetPokemon = msg.options.getBoolean('reset');

        const queryPokemon = await msg.client.pokemon.findFirst({
            where: {
                idx: pokemonID - 1,
                user_id: BigInt(msg.user.id)
            }
        });



    }
}
