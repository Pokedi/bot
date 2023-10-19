import { SlashCommandBuilder } from "discord.js";
import Pokedex from "../../Classes/pokedex.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .addStringOption(option => option.setName('pokemon').setDescription('Name of the Pokemon you are trying to spawn'))
        .setName('forcespawn')
        .setDescription('Force Spawn Pokemon! [Admin]'),
    async execute(msg) {
        if (process.env.DEVIDS && JSON.parse(process.env.DEVIDS).includes(msg.user.id)) {
            try {
                // Define Pokemon
                const content = (msg.options.getString("pokemon")).toLowerCase();
                // Init Spawn if not existent
                if (!msg.channel.spawn) msg.channel.spawn = {};
                // Initializing New Pokemon
                msg.channel.spawn.pokemon = new Pokedex({});
                // Custom
                await msg.channel.spawn.pokemon.searchForID(content);
                // Spawn Pokemon Execution
                msg.channel.spawn.pokemon.SpawnFriendlyV2(true);
                // Send Message Test
                await msg.channel.spawn.pokemon.spawnToChannel(msg.channel);
                // Reply
                await msg.reply({ ephemeral: true, content: "Pokemon Spawned!" });
            } catch (error) {
                console.log(error);
                msg.reply("Error");
            } finally {
            }
        }
    }
}
