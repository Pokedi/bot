import { SlashCommandBuilder } from "discord.js";
import Pokemon from "../../Classes/pokemon.js";
import capitalize from "../../Utilities/Misc/capitalize.js";
import buttonVerification from "../../Utilities/Core/buttonVerification.js";
import { Chance } from "chance";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .addIntegerOption(option => option.setName("id").setRequired(true).setDescription("ID of the Pokemon you intend to release").setMinValue(1))
        .setName('release')
        .setDescription('View your Pokemon!'),
    async execute(msg) {
        const id = msg.options.getInteger('id');

        const fetchPokemon = new Pokemon(await msg.client.prisma.pokemon.findFirst({
            where: {
                idx: id,
                user_id: BigInt(msg.user.id)
            }
        }));

        if (!fetchPokemon.pokemon) return msg.reply({ ephemeral: true, content: "Pokemon does not exist" });

        // Confirmation from User
        const userVerification = await buttonVerification({ interaction: msg });

        if (userVerification) {
            await fetchPokemon.release(msg.client.prisma);

            await msg.followUp(`Your ${capitalize(fetchPokemon.pokemon)} was released into the wild... ${Chance().pickone(["A pack of Luxios hunted it down...", "Zapdos took it away...", "MewTwo teleported it to its sanctuary! It curses you!", "A monster house took it down!", "It scurried away to find its way back home...", "How sad... it's all alone...", "Will it find its way back?"])}`);
        } else {
            msg.followUp("Your Pokemon is happy that it gets to stay with you and not get abandoned in the middle of the woods...");
        }


    }
}