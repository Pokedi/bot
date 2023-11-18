import { SlashCommandBuilder } from "discord.js";
import capitalize from "../../Utilities/Misc/capitalize.js";
import axios from "axios";
import randomint from "../../Utilities/Misc/randomint.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .addStringOption(option => option.setName('pokemon').setRequired(true).setDescription('Name of the Pokemon you are trying to catch'))
        .setName('catch')
        .setDescription('Catch the Pokemon!'),
    async execute(msg) {
        const content = (msg.options.getString("pokemon")).toLowerCase();

        if (msg.channel.spawn && msg.channel.spawn.pokemon) {
            const possibleNames = [msg.channel.spawn.pokemon.pokemon].concat(msg.channel.spawn.pokemon.spawn_names).filter(x => x).map(x => x.toLowerCase());
            if (possibleNames.includes(content)) {

                // Stop NonPlayers
                if (!msg.user.player?.started)
                    return msg.reply("You haven't started your adventure! `/pick` someone to travel with!");

                // Get spawn Pokemon to cache
                const pokemonGrabbed = msg.channel.spawn.pokemon;

                // Remove pokemon from the grass
                delete msg.channel.spawn.pokemon;

                // Attach User
                pokemonGrabbed.user_id = BigInt(msg.user.id);

                // Increment readied IDX
                const [{ idx }] = await msg.client.postgres`SELECT MAX(idx) as idx FROM pokemon WHERE user_id = ${msg.user.id}`;

                pokemonGrabbed.idx = (idx || 0) + 1;

                pokemonGrabbed.guild_id = msg.guild.info.mode ? msg.guild.id : null;

                if (!pokemonGrabbed.level)
                    pokemonGrabbed.level = randomint(40) + 1;

                // Save to DB
                await pokemonGrabbed.save(msg.client.postgres);

                // Add to User's Dex
                await pokemonGrabbed.addToUserDex(msg.client.postgres);

                return msg.reply(`Congrats, you just caught yourself a level ${pokemonGrabbed.level} ${pokemonGrabbed.shiny ? "⭐ " : ""}${capitalize(pokemonGrabbed.pokemon, true)}!`);

            } else
                msg.reply({ ephemeral: true, content: "Wrong guess!" });
        } else msg.reply({ ephemeral: true, content: "No Pokemon right now!" });

    }
}
