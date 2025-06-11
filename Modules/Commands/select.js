import { SlashCommandBuilder } from "discord.js";
import Pokemon from "../../Classes/pokemon.js";
import Player from "../../Classes/player.js";
import capitalize from "../../Utilities/Misc/capitalize.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .addIntegerOption(option => option.setName("id").setDescription("ID of the Pokemon you intend to release").setMinValue(1))
        .addIntegerOption(option => option.setName("slot").setDescription("ID of the Pokemon you intend to release").setMinValue(1).setMaxValue(6))
        .addBooleanOption(option => option.setName('clear').setDescription("Clear entire team"))
        .addBooleanOption(option => option.setName("help").setDescription("View details on how to use this command"))
        .setName('select')
        .setDescription('Select your Pokemon!'),
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
            // Remove the command name
            args.shift();
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

        if (!userDB.started) return msg.reply({ ephemeral: true, content: "User not found" });

        if (clearTeam) {
            userDB.selected = [];
            await userDB.save(msg.client.postgres);
            return await msg.reply("Your team was cleared...");
        }

        if (!id || isNaN(id)) return msg.reply({ ephemeral: true, content: "Please provide a valid Pokémon ID." });

        const [queryPokemon] = await msg.client.postgres`SELECT * FROM pokemon WHERE idx = ${id} AND user_id = ${BigInt(msg.user.id)}`;

        if (!queryPokemon) return msg.reply({ ephemeral: true, content: "Pokemon does not exist" });

        const fetchPokemon = new Pokemon(queryPokemon);

        if (!fetchPokemon.pokemon) return msg.reply({ ephemeral: true, content: "Pokemon does not exist" });

        let z = userDB.selected || [];

        if (z[0] !== undefined && z[slot] !== undefined) {
            if (z[slot] != undefined) {
                if (z.indexOf(fetchPokemon.id) != -1)
                    z[z.indexOf(fetchPokemon.id)] = z[slot];
                z[slot] = fetchPokemon.id;
            }
        } else {
            if (z.includes(fetchPokemon.id))
                return msg.reply('that pokemon already exists');
            z.push(fetchPokemon.id)
        }

        userDB.selected = z;

        await userDB.save(msg.client.postgres);

        await msg.reply(`Successfully placed ${capitalize(fetchPokemon.pokemon, true)} (Nº ${id}) on slot Nº ${slot + 1}`);

        // Replace if User Profile Readied
        if (msg.user?.player)
            msg.user.player.selected = z;

    }
}