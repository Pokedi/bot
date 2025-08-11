import { MessageFlags, SlashCommandBuilder } from "discord.js";
import Pokedex from "../../Classes/pokedex.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('forcespawn')
        .setNameLocalizations({
            'pt-BR': 'forcaraparecimento',
            'es-ES': 'forzaraparicion',
            'de': 'erzwingespawn',
            'fr': 'forcerapparition',
            // 'ar': 'فرض-الظهور'
        })
        .setDescription('Force Spawn Pokemon! [Admin]')
        .setDescriptionLocalizations({
            'pt-BR': 'Forçar o aparecimento de Pokémon! [Admin]',
            'es-ES': '¡Forzar la aparición de Pokémon! [Admin]',
            'de': 'Erzwinge das Spawnen von Pokémon! [Admin]',
            'fr': 'Forcer l\'apparition de Pokémon! [Admin]',
            // 'ar': 'فرض ظهور بوكيمون! [مسؤول]'
        })
        .addStringOption(option => option.setName('pokemon').setDescription('Name of the Pokemon you are trying to spawn')
            .setNameLocalizations({
                'pt-BR': 'pokemon',
                'es-ES': 'pokemon',
                'de': 'pokemon',
                'fr': 'pokemon',
                // 'ar': 'بوكيمون'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'Nome do Pokémon que você está tentando fazer aparecer',
                'es-ES': 'Nombre del Pokémon que estás intentando que aparezca',
                'de': 'Name des Pokémons, das du spawnen lassen möchtest',
                'fr': 'Nom du Pokémon que vous essayez de faire apparaître',
                // 'ar': 'اسم البوكيمون الذي تحاول إظهاره'
            })),
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
                await msg.reply({ flags: MessageFlags.Ephemeral, content: "Pokemon Spawned!" });
            } catch (error) {
                console.log(error);
                msg.reply("Error");
            } finally {
            }
        }
    }
}
