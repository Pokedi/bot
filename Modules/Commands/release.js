import { MessageFlags, SlashCommandBuilder } from "discord.js";
import Pokemon from "../../Classes/pokemon.js";
import capitalize from "../../Utilities/Misc/capitalize.js";
import buttonVerification from "../../Utilities/Core/buttonVerification.js";
import { Chance } from "chance";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('release')
        .setNameLocalizations({
            'pt-BR': 'soltar',
            'es-ES': 'liberar',
            'de': 'freilassen',
            'fr': 'relâcher',
            // 'ar': 'إطلاق'
        })
        .setDescription('Release your Pokemon!')
        .setDescriptionLocalizations({
            'pt-BR': 'Solte seu Pokémon!',
            'es-ES': '¡Libera a tu Pokémon!',
            'de': 'Lass dein Pokémon frei!',
            'fr': 'Relâchez votre Pokémon!',
            // 'ar': 'أطلق بوكيمونك!'
        })
        .addIntegerOption(option => option.setName("id").setDescription("ID of the Pokemon you intend to release").setMinValue(1)
            .setNameLocalizations({
                'pt-BR': 'id',
                'es-ES': 'id',
                'de': 'id',
                'fr': 'id',
                // 'ar': 'المعرف'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'ID do Pokémon que você pretende soltar',
                'es-ES': 'ID del Pokémon que pretendes liberar',
                'de': 'ID des Pokémon, das du freilassen möchtest',
                'fr': 'ID du Pokémon que vous avez l\'intention de relâcher',
                // 'ar': 'معرف البوكيمون الذي تنوي إطلاقه'
            }))
        .addBooleanOption(option => option.setName("latest").setDescription("Selects the last pokemon to release")
            .setNameLocalizations({
                'pt-BR': 'ultimo',
                'es-ES': 'ultimo',
                'de': 'letzte',
                'fr': 'dernier',
                // 'ar': 'الأخير'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'Seleciona o último pokemon a ser solto',
                'es-ES': 'Selecciona el último pokemon a liberar',
                'de': 'Wählt das letzte Pokémon zum Freilassen aus',
                'fr': 'Sélectionne le dernier pokémon à relâcher',
                // 'ar': 'يختار آخر بوكيمون لإطلاقه'
            })),
    async execute(msg) {

        const id = msg.options.getInteger('id');

        const latest = msg.options.getBoolean('latest');

        if (!id && latest == null)
            return msg.reply("Please select one of the available options...");

        const [fetchPokemonRow] = await msg.client.postgres`SELECT pokemon, id FROM pokemon WHERE user_id = ${msg.user.id} ${id ? msg.client.postgres`OR idx = ${id}` : msg.client.postgres``} ORDER BY idx DESC LIMIT 1`;

        if (!fetchPokemonRow)
            return msg.reply("No pokemon found... You're quite lonely to want to abandon someone that doesn't exist.");

        const fetchPokemon = new Pokemon(fetchPokemonRow);

        if (!fetchPokemon.pokemon) return msg.reply({ flags: MessageFlags.Ephemeral, content: "Pokemon does not exist" });

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