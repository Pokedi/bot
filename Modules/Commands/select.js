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
        .setName('select')
        .setDescription('Select your Pokemon!'),
    async execute(msg) {

        const id = msg.options.getInteger('id');
        const slot = (msg.options.getInteger('slot') || 1) - 1;
        const clearTeam = msg.options.getBoolean('clear');

        const userDB = new Player({ id: BigInt(msg.user.id) });

        await userDB.fetch(msg.client.postgres);

        if (!userDB.started) return msg.reply({ ephemeral: true, content: "User not found" });

        if (clearTeam) return userDB.selected = [], await userDB.save(msg.client.postgres), await msg.reply("Your team was cleared...");

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

        await msg.reply(`Successfully placed ${capitalize(fetchPokemon.pokemon)} (Nº ${id}) on slot Nº ${slot + 1}`);

    }
}