import { SlashCommandBuilder } from "discord.js";
import Pokemon from "../../Classes/pokemon.js";
import capitalize from "../../Utilities/Misc/capitalize.js";
import buttonVerification from "../../Utilities/Core/buttonVerification.js";
import { Chance } from "chance";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .addIntegerOption(option => option.setName("id").setDescription("ID of the Pokemon you intend to release").setMinValue(1))
        .addBooleanOption(option => option.setName("latest").setDescription("Selects the last pokemon to release"))
        .setName('release')
        .setDescription('Release your Pokemon!'),
    async execute(msg) {

        const id = msg.options.getInteger('id');

        const latest = msg.options.getBoolean('latest');

        if (!id && latest == null)
            return msg.reply("Please select one of the available options...");

        const [fetchPokemonRow] = await msg.client.postgres`SELECT pokemon, id FROM pokemon WHERE user_id = ${msg.user.id} ${id ? msg.client.postgres`OR idx = ${id}` : msg.client.postgres``} ORDER BY idx DESC LIMIT 1`;

        if (!fetchPokemonRow)
            return msg.reply("No pokemon found... You're quite lonely to want to abandon someone that doesn't exist.");

        const fetchPokemon = new Pokemon(fetchPokemonRow);

        if (!fetchPokemon.pokemon) return msg.reply({ ephemeral: true, content: "Pokemon does not exist" });

        // Confirmation from User
        const userVerification = await buttonVerification({ interaction: msg, textContent: `You are currently releasing your ${capitalize(fetchPokemon.pokemon, true)}. You serious about this abandonment? You know you'll lose all custody, right?` });

        if (userVerification) {
            await fetchPokemon.release(msg.client.postgres);

            await msg.followUp(`Your ${capitalize(fetchPokemon.pokemon)} was released into the wild... ${Chance().pickone(["A pack of Luxios hunted it down...", "Zapdos took it away...", "MewTwo teleported it to its sanctuary! It curses you!", "A monster house took it down!", "It scurried away to find its way back home...", "How sad... it's all alone...", "Will it find its way back?"])}`);
        } else {
            msg.followUp("Your Pokemon is happy that it gets to stay with you and not get abandoned in the middle of the woods...");
        }


    }
}