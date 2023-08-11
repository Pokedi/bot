import { SlashCommandBuilder } from "discord.js";
import Pokemon from "../../Classes/pokemon.js";

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
                msg.channel.spawn.pokemon = new Pokemon({});
                // Spawn Pokemon Execution
                msg.channel.spawn.pokemon.spawnFriendly(content);
                // Send Message Test
                await msg.channel.spawn.pokemon.spawnToChannel(msg);
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