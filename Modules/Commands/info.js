import { AttachmentBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import userPokemonInfoModule from "../../Utilities/Pokemon/userPokemonInfoModule.js";
import builder from "../Database/QueryBuilder/queryGenerator.js";
import Player from "../../Classes/player.js";
import Pokedex from "../../Classes/pokedex.js";
import getDominantColor from "../../Utilities/Misc/getDominantColor.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('info')
        .setNameLocalizations({
            'pt-BR': 'info',
            'es-ES': 'info',
            'de': 'info',
            'fr': 'info',
            // 'ar': 'معلومات'
        })
        .setDescription('View your Pokemon!')
        .setDescriptionLocalizations({
            'pt-BR': 'Veja seu Pokémon!',
            'es-ES': '¡Mira tu Pokémon!',
            'de': 'Sieh dir dein Pokémon an!',
            'fr': 'Voir votre Pokémon!',
            // 'ar': 'اعرض بوكيمونك!'
        })
        .addStringOption(option => option.setName('query').setDescription('Type in the ID of the pokemon. (You may type in "latest" for the last one)')
            .setNameLocalizations({
                'pt-BR': 'consulta',
                'es-ES': 'consulta',
                'de': 'abfrage',
                'fr': 'requête',
                // 'ar': 'استعلام'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'Digite o ID do pokemon. (Você pode digitar "latest" para o último)',
                'es-ES': 'Escribe el ID del pokemon. (Puedes escribir "latest" para el último)',
                'de': 'Gib die ID des Pokemons ein. (Du kannst "latest" für das letzte eingeben)',
                'fr': 'Tapez l\'ID du pokémon. (Vous pouvez taper "latest" pour le dernier)',
                // 'ar': 'اكتب معرف البوكيمون. (يمكنك كتابة "latest" للأخير)'
            }))
        .addBooleanOption(option => option.setName("help").setDescription("View details on how to use this command")
            .setNameLocalizations({
                'pt-BR': 'ajuda',
                'es-ES': 'ayuda',
                'de': 'hilfe',
                'fr': 'aide',
                // 'ar': 'مساعدة'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'Veja detalhes sobre como usar este comando',
                'es-ES': 'Ver detalles sobre cómo usar este comando',
                'de': 'Details zur Verwendung dieses Befehls anzeigen',
                'fr': 'Voir les détails sur la façon d\'utiliser cette commande',
                // 'ar': 'عرض تفاصيل حول كيفية استخدام هذا الأمر'
            })),
    alias: ["i"],
    mention_support: true,
    async execute(msg) {
        // Help redirect
        if (msg.options?.getBoolean?.("help"))
            return msg.options._hoistedOptions.push({ name: "command_name", type: 3, value: "info" }),
                msg.client.commands.get("help")(msg);

        // --- Mention support ---
        let query = "";
        if (msg.isMessage) {
            // Split everything by spaces
            const args = msg.content.trim().split(/\s+/);
            // Example: "@Bot info latest" or "@Bot i l" or "@Bot info 5"
            query = args[0]?.toLowerCase() || "";
        } else {
            query = (msg.options.getString?.("query") || "").toLowerCase();
        }

        // Determine what the user wants
        const isID = !isNaN(parseInt(query)) && parseInt(query);

        // Todo: Add language support for "latest" and "l"
        const isLatest = query === "latest" || query === "l";

        const player = new Player({ id: BigInt(msg.user.id) });
        await player.fetchColumns(msg.client.postgres, "id, selected");

        // Count Total Pokemon
        const [{ count: countPokemon }] = await msg.client.postgres`SELECT MAX(idx) as count FROM pokemon WHERE user_id = ${player.id} LIMIT 1`;

        // Build query for the pokemon
        let where = {};
        if (isLatest) {
            where = { idx: countPokemon, user_id: player.id };
        } else if (isID) {
            where = { user_id: player.id, idx: parseInt(query) };
        } else if (player.selected && player.selected.length) {
            where = { id: player.selected[0] };
        } else {
            return msg.reply({ flags: MessageFlags.Ephemeral, content: "You don't have any Pokémon selected or available." });
        }

        const { values, text } = builder.select('pokemon', "*").where(where).limit(1);

        const [selectedPokemon] = await msg.client.postgres.unsafe(text, values);

        if (!selectedPokemon)
            return msg.reply({ flags: MessageFlags.Ephemeral, content: "Pokémon does not exist." });

        let processedPokemon = new Pokedex(selectedPokemon);

        if (!processedPokemon.id)
            return msg.reply({ flags: MessageFlags.Ephemeral, content: "Pokémon does not exist." });

        await processedPokemon.getPokemonSpecies();

        if (!processedPokemon.pokedex.id)
            return msg.reply({ flags: MessageFlags.Ephemeral, content: "This Pokémon has not been registered in the database. Please contact an admin for more help." });

        const file = new AttachmentBuilder(`../pokediAssets/pokemon/${processedPokemon.shiny ? "shiny" : "regular"}/${processedPokemon.pokemon}.png`);
        const color = await getDominantColor(file.attachment, true);

        return msg.reply({
            embeds: [userPokemonInfoModule(processedPokemon, null, countPokemon, color)],
            files: [file]
        });
    }
}
