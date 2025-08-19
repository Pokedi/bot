import { SlashCommandBuilder } from "discord.js";
import Player from "../../Classes/player.js";
import Pokedex from "../../Classes/pokedex.js";

export default {
    data: "",
    data: new SlashCommandBuilder()
        .setName('pick').setNameLocalizations({
            "de": "wählen",
            "es-ES": "escoger",
            "pt-BR": "escolher",
            "fr": "choisir",
            // "ar": "اختر"
        })
        .setDescription('Pick your starter pokemon and embark on your journey to the new world!')
        .setDescriptionLocalizations({
            'pt-BR': 'Escolha seu pokemon inicial e embarque em sua jornada para o novo mundo!',
            'es-ES': '¡Elige tu pokemon inicial y emprende tu viaje hacia el nuevo mundo!',
            'de': 'Wähle dein Starter-Pokémon und begib dich auf deine Reise in die neue Welt!',
            'fr': 'Choisissez votre pokémon de départ et embarquez pour votre voyage vers le nouveau monde!',
            // 'ar': 'اختر بوكيمون البداية الخاص بك وانطلق في رحلتك إلى العالم الجديد!'
        })
        .addStringOption(option => option.setName('pokemon').setDescription('Type in the name of a starter Pokemon').setRequired(true)
            .setNameLocalizations({
                'pt-BR': 'pokemon',
                'es-ES': 'pokemon',
                'de': 'pokemon',
                'fr': 'pokemon',
                // 'ar': 'بوكيمون'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'Digite o nome de um Pokémon inicial',
                'es-ES': 'Escribe el nombre de un Pokémon inicial',
                'de': 'Gib den Namen eines Starter-Pokémons ein',
                'fr': 'Tapez le nom d\'un Pokémon de départ',
                // 'ar': 'اكتب اسم بوكيمون بداية'
            })
        ),
    async execute(msg) {

        const player = new Player({ id: msg.user.id, /* guild_id: msg.guild.info.mode ? msg.guild.id : null */ });

        await player.fetch(msg.client.postgres);

        if (player.started)
            return msg.reply("you already have started");

        let selectedStarter = ["bulbasaur", "charmander", "squirtle", "pikachu", "eevee", "chikorita", "cyndaquil", "totodile", "treecko", "torchic", "mudkip", "turtwig", "chimchar", "piplup", "snivy", "tepig", "oshawott", "chespin", "fennekin", "froakie", "rowlet", "litten", "popplio", "grookey", "scorbunny", "sobble", "pumpkinsaur"].find(x => x == msg.options.getString("pokemon").toLowerCase());

        if (!selectedStarter)
            return msg.reply("sorry, but that's not a valid starter! Please try again by selecting whatever is available in `/start`!")

        const [userAccount] = await msg.client.postgres`INSERT INTO users ${msg.client.postgres({
            id: BigInt(msg.user.id),
            bal: 200,
            started: new Date(),
            selected: [1],
            /* guild_id: msg.guild.info.mode ? msg.guild.id : null */
        })} RETURNING *`;

        // Set it to Collection Cache
        msg.user.player = userAccount;

        const newPokemonForUser = new Pokedex({});

        await newPokemonForUser.generateV2(selectedStarter, { user_id: BigInt(msg.user.id), idx: 1, /* guild_id: msg.guild.info.mode ? msg.guild.id : null */ });

        if (!newPokemonForUser.moves.length) newPokemonForUser.moves = ["tackle"];

        await newPokemonForUser.save(msg.client.postgres);

        if (!userAccount) return msg.reply("A problem occurred creating your account.");

        return msg.reply("Welcome to Pokedi! Let's start with /info to check your cutie patotie :3")
    }
};