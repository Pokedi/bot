import { SlashCommandBuilder } from "discord.js";

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
    async function(msg) {
        if (msg.user.info.started) 
            return msg.reply("you already have started");

        let content = msg.options.getString("pokemon").toLowerCase();
        const pk = fp(content.toLowerCase());

        if (!pk || !["bulbasaur", "charmander", "squirtle", "pikachu", "eevee", "chikorita", "cyndaquil", "totodile", "treecko", "torchic", "mudkip", "turtwig", "chimchar", "piplup", "snivy", "tepig", "oshawott", "chespin", "fennekin", "froakie", "rowlet", "litten", "popplio", "grookey", "scorbunny", "sobble", "pumpkinsaur"].includes(pk._id))
            return msg.reply("sorry, but that's not a valid starter! Please try again by selecting whatever is available in `p!start`!")

        let level = 1;

        let starter = (Object.assign({
            pokemon: pk._id,
            user_id: msg.user.id,
            s_atk: Chance().integer({
                min: 0,
                max: 31
            }),
            s_def: Chance().integer({
                min: 0,
                max: 31
            }),
            s_hp: Chance().integer({
                min: 0,
                max: 31
            }),
            s_spatk: Chance().integer({
                min: 0,
                max: 31
            }),
            s_spdef: Chance().integer({
                min: 0,
                max: 31
            }),
            s_spd: Chance().integer({
                min: 0,
                max: 31
            }),
            level,
            exp: 1,
            nature: Chance().pickone(natures),
            timestamp: new Date()
        }, (() => {
            let ick = {};
            if (!pk.moves)
                return undefined;
            Chance().shuffle(Object.entries(pk.moves).filter(x => x[1] <= level)).splice(0, 4).forEach((x, i) => {
                ick["m_" + (i + 1)] = x[0]
            }
            );
            return ick;
        }
        )()));


        let [id] = await sql`INSERT INTO users (id, bal, started, selected) VALUES (${msg.user.id}, 200, ${new Date()}, '{1}') RETURNING id`;

        if (!id) return msg.reply("A problem occurred creating your account.");

        await inserter(starter);

        return msg.followUp("Welcome to Pokedi! Let's start with /info to check your cutie patotie :3")
    }
};