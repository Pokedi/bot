import i18n from "i18n";

import { MessageFlags, SlashCommandBuilder } from "discord.js";
import capitalize from "../../Utilities/Misc/capitalize.js";
import randomint from "../../Utilities/Misc/randomint.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('catch')
        .setNameLocalizations({
            'pt-BR': 'capturar',
            'es-ES': 'capturar',
            'de': 'fangen',
            'fr': 'attraper',
            // 'ar': 'امسك'
        })
        .setDescription('Catch the Pokemon!')
        .setDescriptionLocalizations({
            'pt-BR': 'Capture o Pokémon!',
            'es-ES': '¡Captura el Pokémon!',
            'de': 'Fange das Pokémon!',
            'fr': 'Attrapez le Pokémon!',
            // 'ar': 'امسك البوكيمون!'
        })
        .addStringOption(option => option.setName('pokemon').setNameLocalizations({
            'pt-BR': 'pokemon',
            'es-ES': 'pokemon',
            'de': 'pokemon',
            'fr': 'pokemon',
            // 'ar': 'بوكيمون'
        }).setRequired(true).setDescription('Name of the Pokemon you are trying to catch').setDescriptionLocalizations({
            'pt-BR': 'Nome do Pokémon que você está tentando capturar',
            'es-ES': 'Nombre del Pokémon que estás tratando de atrapar',
            'de': 'Name des Pokémons, das du fangen möchtest',
            'fr': 'Nom du Pokémon que vous essayez d\'attraper',
            // 'ar': 'اسم البوكيمون الذي تحاول الإمساك به'
        })),
    alias: ["c"],
    mention_support: true,
    async execute(msg) {

        const content = msg.isMessage && msg.content
            ? msg.content.toLowerCase()
            : (msg.options && msg.options.getString("pokemon"))
                ? msg.options.getString("pokemon").toLowerCase()
                : null;

        // No Content? Ignore
        if (!content)
            return;

        if (msg.channel.spawn && msg.channel.spawn.pokemon) {
            const possibleNames = [msg.channel.spawn.pokemon.pokemon].concat(msg.channel.spawn.pokemon.spawn_names).filter(x => x).map(x => x.toLowerCase());

            if (possibleNames.includes(content)) {

                // Stop NonPlayers
                if (!msg.user.player?.started)
                    return msg.reply(i18n.__("default.not_started"));

                // Get spawn Pokemon to cache
                const pokemonGrabbed = msg.channel.spawn.pokemon;

                // Remove pokemon from the grass
                delete msg.channel.spawn.pokemon;

                // Attach User
                pokemonGrabbed.user_id = BigInt(msg.user.id);

                // Increment readied IDX
                const [{ idx }] = await msg.client.postgres`SELECT MAX(idx) as idx FROM pokemon WHERE user_id = ${msg.user.id}`;

                pokemonGrabbed.idx = (idx || 0) + 1;

                // pokemonGrabbed.guild_id = msg.guild.info.mode ? msg.guild.id : null;

                if (!pokemonGrabbed.level)
                    pokemonGrabbed.level = randomint(40) + 1;

                // Save to DB
                await pokemonGrabbed.save(msg.client.postgres);

                // Add to User's Dex
                await pokemonGrabbed.addToUserDex(msg.client.postgres);

                return msg.reply(i18n.__('commands.catch.caught', { level: pokemonGrabbed.level, shiny: pokemonGrabbed.shiny ? "⭐ " : "", pokemon: capitalize(pokemonGrabbed.pokemon, true) }));

            } else
                msg.reply({ flags: MessageFlags.Ephemeral, content: i18n.__('commands.catch.wrong') });
        } else msg.reply({ flags: MessageFlags.Ephemeral, content: i18n.__('commands.catch.no_pokemon') });

    }
}
