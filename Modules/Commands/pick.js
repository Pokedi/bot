import { SlashCommandBuilder } from "discord.js";
import findPokemon from "../../Utilities/Pokemon/findPokemon.js";
import builder from "../Database/QueryBuilder/queryGenerator.js";
import Player from "../../Classes/player.js";
import Pokedex from "../../Classes/pokedex.js";

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

        const player = new Player({ id: msg.user.id });

        await player.fetch(msg.client.postgres);

        if (player.started)
            return msg.reply("you already have started");

        let selectedStarter = ["bulbasaur", "charmander", "squirtle", "pikachu", "eevee", "chikorita", "cyndaquil", "totodile", "treecko", "torchic", "mudkip", "turtwig", "chimchar", "piplup", "snivy", "tepig", "oshawott", "chespin", "fennekin", "froakie", "rowlet", "litten", "popplio", "grookey", "scorbunny", "sobble", "pumpkinsaur"].find(x => x == msg.options.getString("pokemon").toLowerCase());

        if (!selectedStarter)
            return msg.reply("sorry, but that's not a valid starter! Please try again by selecting whatever is available in `/start`!")

        const { text, values } = builder.insert("users", {
            id: BigInt(msg.user.id),
            bal: 200,
            started: new Date(),
            selected: [1]
        }).returning("*");

        const [userAccount] = await msg.client.postgres.unsafe(text, values);

        // Set it to Collection Cache
        msg.user.player = userAccount;

        const newPokemonForUser = new Pokedex({});

        await newPokemonForUser.generateV2(selectedStarter, { user_id: BigInt(msg.user.id), idx: 1 });

        await newPokemonForUser.save(msg.client.postgres);

        if (!userAccount) return msg.reply("A problem occurred creating your account.");

        return msg.reply("Welcome to Pokedi! Let's start with /info to check your cutie patotie :3")
    }
};