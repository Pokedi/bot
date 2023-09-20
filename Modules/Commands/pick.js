import { SlashCommandBuilder } from "discord.js";
import Pokemon from "../../Classes/pokemon.js";
import findPokemon from "../../Utilities/Pokemon/findPokemon.js";

export default {
    data: "",
    data: new SlashCommandBuilder()
        .setName('pick').setNameLocalizations({
            "de": "wählen",
            "es-ES": "escoger",
            "pt-BR": "escolher"
        })
        .setDescription('Pick your starter pokemon and embark on your journey to the new world!')
        .addStringOption(option => option.setName('pokemon').setDescription('Type in the name of a starter Pokemon').setRequired(true)
        ),
    async execute(msg) {
        if (msg.user.info.started)
            return msg.reply("you already have started");

        let content = msg.options.getString("pokemon").toLowerCase();
        const pk = findPokemon(content.toLowerCase());

        if (!pk || !["bulbasaur", "charmander", "squirtle", "pikachu", "eevee", "chikorita", "cyndaquil", "totodile", "treecko", "torchic", "mudkip", "turtwig", "chimchar", "piplup", "snivy", "tepig", "oshawott", "chespin", "fennekin", "froakie", "rowlet", "litten", "popplio", "grookey", "scorbunny", "sobble", "pumpkinsaur"].includes(pk._id))
            return msg.reply("sorry, but that's not a valid starter! Please try again by selecting whatever is available in `/start`!")

        const userAccount = await msg.client.prisma.users.create({
            data: {
                id: BigInt(msg.user.id),
                bal: 200,
                started: new Date(),
                selected: [1]
            }
        });

        // Set it to Collection Cache
        msg.user.player = userAccount;

        const newPokemonForUser = new Pokemon({});

        newPokemonForUser.generate(pk._id, { user_id: BigInt(msg.user.id), idx: 1 });

        await newPokemonForUser.save(msg.client.postgres);

        if (!userAccount) return msg.reply("A problem occurred creating your account.");

        return msg.reply("Welcome to Pokedi! Let's start with /info to check your cutie patotie :3")
    }
};