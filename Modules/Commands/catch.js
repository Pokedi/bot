import { SlashCommandBuilder } from "discord.js";
import capitalize from "../../Utilities/Misc/capitalize.js";
import axios from "axios";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .addStringOption(option => option.setName('pokemon').setDescription('Name of the Pokemon you are trying to catch'))
        .setName('catch')
        .setDescription('Catch the Pokemon!'),
    async execute(msg) {
        const content = (msg.options.getString("pokemon")).toLowerCase();

        if (msg.channel.spawn && msg.channel.spawn.pokemon) {
            const possibleNames = [msg.channel.spawn.pokemon.pokemon].concat(msg.channel.spawn.pokemon.spawn_names).filter(x => x);
            if (possibleNames.includes(content)) {

                // Get spawn Pokemon to cache
                const pokemonGrabbed = msg.channel.spawn.pokemon;

                // Remove pokemon from the grass
                delete msg.channel.spawn.pokemon;

                // Attach User
                pokemonGrabbed.user_id = BigInt(msg.user.id);

                // Increment readied IDX
                pokemonGrabbed.idx = ((await msg.client.pokemon.findFirst({
                    where: {
                        user_id: BigInt()
                    }, orderBy: { idx: "desc" }
                }))?.idx || 0) + 1;
                
                // Save to DB
                await pokemonGrabbed.save(msg.client.prisma);

                // Add to User's Dex
                await pokemonGrabbed.addToUserDex(msg.client.prisma);

                return msg.reply(`Congrats, you just caught yourself a level ${pokemonGrabbed.level} ${pokemonGrabbed.shiny ? "⭐ " : ""}${capitalize(pokemonGrabbed.pokemon)}!`)
            } else
                msg.reply({ ephemeral: true, content: "Wrong guess!" });
        } else msg.reply({ ephemeral: true, content: "No Pokemon right now!" });

    }
}
