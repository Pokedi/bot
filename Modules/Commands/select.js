import i18n from "i18n";

import { MessageFlags, SlashCommandBuilder } from "discord.js";
import Pokemon from "../../Classes/pokemon.js";
import Player from "../../Classes/player.js";
import capitalize from "../../Utilities/Misc/capitalize.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('select')
        .setNameLocalizations({
            'pt-BR': 'selecionar',
            'es-ES': 'seleccionar',
            'de': 'auswählen',
            'fr': 'sélectionner',
            // 'ar': 'تحديد'
        })
        .setDescription('Select your Pokemon!')
        .setDescriptionLocalizations({
            'pt-BR': 'Selecione seu Pokémon!',
            'es-ES': '¡Selecciona tu Pokémon!',
            'de': 'Wähle dein Pokémon aus!',
            'fr': 'Sélectionnez votre Pokémon!',
            // 'ar': 'اختر بوكيمونك!'
        })
        .addIntegerOption(option => option.setName("id").setDescription("ID of the Pokemon you intend to select").setMinValue(1)
            .setNameLocalizations({
                'pt-BR': 'id',
                'es-ES': 'id',
                'de': 'id',
                'fr': 'id',
                // 'ar': 'المعرف'
            }))
        .addIntegerOption(option => option.setName("slot").setDescription("Slot where you would like to place your Pokemon").setMinValue(1).setMaxValue(6)
            .setNameLocalizations({
                'pt-BR': 'espaco',
                'es-ES': 'ranura',
                'de': 'steckplatz',
                'fr': 'emplacement',
                // 'ar': 'فتحة'
            }))
        .addBooleanOption(option => option.setName('clear').setDescription("Clear entire team")
            .setNameLocalizations({
                'pt-BR': 'limpar',
                'es-ES': 'limpiar',
                'de': 'löschen',
                'fr': 'effacer',
                // 'ar': 'مسح'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'Limpar equipe inteira',
                'es-ES': 'Limpiar equipo completo',
                'de': 'Ganzes Team löschen',
                'fr': 'Effacer toute l\'équipe',
                // 'ar': 'مسح الفريق بأكمله'
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
    alias: ["s"],
    mention_support: true,
    async execute(msg) {

        // Redirect to Help
        if (msg.options?.getBoolean?.("help"))
            return msg.options._hoistedOptions.push({ name: "command_name", type: 3, value: "select" }),
                msg.client.commands.get("help")(msg);

        // Support for mention-based commands
        let id, slot, clearTeam;
        if (msg.isMessage && msg.content) {
            // Example: "@Bot select 123 2 --clear"
            const args = msg.content.trim().split(/\s+/);
            // Parse arguments
            id = parseInt(args[0]);
            slot = args[1] ? parseInt(args[1]) - 1 : 0;
            clearTeam = args.includes("--clear") || args.includes("-c");
        } else {
            id = msg.options.getInteger?.('id');
            slot = (msg.options.getInteger?.('slot') || 1) - 1;
            clearTeam = msg.options.getBoolean?.('clear');
        }

        const userDB = new Player({ id: BigInt(msg.user.id) });

        await userDB.fetch(msg.client.postgres);

        if (!userDB.started) return msg.reply({ flags: MessageFlags.Ephemeral, content: "User not found" });

        if (clearTeam) {
            userDB.selected = [];
            await userDB.save(msg.client.postgres);
            return await msg.reply(i18n.__("commands.select.team_cleared"));
        }

        if (!id || isNaN(id)) return msg.reply({ flags: MessageFlags.Ephemeral, content: i18n.__('commands.select.invalid_pokemon') });

        const [queryPokemon] = await msg.client.postgres`SELECT * FROM pokemon WHERE idx = ${id} AND user_id = ${BigInt(msg.user.id)}`;

        if (!queryPokemon) return msg.reply({ flags: MessageFlags.Ephemeral, content: i18n.__("commands.select.nonexistent") });

        const fetchPokemon = new Pokemon(queryPokemon);

        if (!fetchPokemon.pokemon) return msg.reply({ flags: MessageFlags.Ephemeral, content: i18n.__("commands.select.nonexistent") });

        let z = userDB.selected || [];

        if (z[0] !== undefined && z[slot] !== undefined) {
            if (z[slot] != undefined) {
                if (z.indexOf(fetchPokemon.id) != -1)
                    z[z.indexOf(fetchPokemon.id)] = z[slot];
                z[slot] = fetchPokemon.id;
            }
        } else {
            if (z.includes(fetchPokemon.id))
                return msg.reply(i18n.__("commands.select.nonexistent"));
            z.push(fetchPokemon.id)
        }

        userDB.selected = z;

        await userDB.save(msg.client.postgres);

        await msg.reply(i18n.__("commands.select.placement", { pokemon: capitalize(fetchPokemon.pokemon, true), id, slot: slot + 1 }));

        // Replace if User Profile Readied
        if (msg.user?.player)
            msg.user.player.selected = z;

    }
}