import { SlashCommandBuilder } from "discord.js";
import capitalize from "../../Utilities/Misc/capitalize.js";

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
                const pokemonGrabbed = msg.channel.spawn.pokemon;
                delete msg.channel.spawn.pokemon;
                pokemonGrabbed.user_id = BigInt(msg.user.id);
                pokemonGrabbed.idx = (await axios.get('http://localhost:483/user/idx/' + msg.user.id)).data.idx;
                await pokemonGrabbed.save(msg.client.prisma);
                await pokemonGrabbed.addToUserDex(msg.client.prisma);
                return msg.reply(`Congrats, you just caught yourself a level ${pokemonGrabbed.level} ${pokemonGrabbed.shiny ? "⭐ " : ""}${capitalize(pokemonGrabbed.pokemon)}!`)
            } else
                msg.reply({ ephemeral: true, content: "Wrong guess!" });
        } else msg.reply({ ephemeral: true, content: "No Pokemon right now!" });

    }
}
