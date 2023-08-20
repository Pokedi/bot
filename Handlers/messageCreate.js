import Chance from "chance";
import Pokemon from "../Classes/pokemon.js";
import Player from "../Classes/player.js";
import randomint from "../Utilities/Misc/randomint.js";

const chance = Chance();

async function messageCreate(msg, e) {

    if (!msg.guild || (msg.member && msg.member.user.bot))
        return;

    // Spawn System
    if (!msg.channel.spawn) msg.channel.spawn = { count: chance.integer({ min: 30, max: 140 }), pokemon: {} };

    // Decrementing Count for Spawn
    msg.channel.spawn.count--;

    // Spawn 
    if (msg.channel.spawn.count < 0) {
        msg.channel.spawn.count = chance.integer({ min: 30, max: 200 });

        // Initializing New Pokemon
        msg.channel.spawn.pokemon = new Pokemon({});
        // Spawn Pokemon Execution
        msg.channel.spawn.pokemon.spawnFriendly();
        // Send Message Test
        // msg.channel.send("Pokemon to Spawn Config: " + JSON.stringify(msg.channel.spawn.pokemon));
        await msg.channel.spawn.pokemon.spawnToChannel(msg);
    }

    if (!msg.author.player) msg.author.player = new Player(msg.author), await msg.author.player.fetch(msg.client.prisma);

    if (msg.author.player && msg.author.player.started) {
        if (randomint(10000) < 20) {
            if (await msg.author.player.levelUp(msg.client.prisma))
                msg.channel.send("Congrats on being Level " + msg.author.player.level + ", Champ.");
        }
    }

    return true;
}

export default messageCreate;