import Chance from "chance";
import Player from "../Classes/player.js";
import randomint from "../Utilities/Misc/randomint.js";
import capitalize from "../Utilities/Misc/capitalize.js";
import Pokedex from "../Classes/pokedex.js";
import setMessageCache from "../Utilities/Misc/setMessageCache.js";

const chance = Chance();

async function messageCreate(msg, e) {

    if (!msg.guild || (msg.member && msg.member.user.bot))
        return;

    await setMessageCache(msg);

    // Spawn System
    if (!msg.channel.spawn) msg.channel.spawn = { count: chance.integer({ min: 30, max: 140 }), pokemon: {}, lastSpawn: Date.now() };

    // Decrementing Count for Spawn
    msg.channel.spawn.count--;

    // Spawn 
    spawnIF: if (msg.channel.spawn.count < 0 && Date.now() - msg.channel.spawn.lastSpawn > (1000 * 60 * 2)) {
        // Reassignment
        msg.channel.spawn.count = chance.integer({ min: 30, max: 50 });
        msg.channel.spawn.lastSpawn = Date.now();

        // IF Guild disabled, break
        if (msg.guild.configs?.spawn?.disabled) break spawnIF;

        const channelToRedirectTo = msg.guild?.configs?.spawn?.config ? chance.pickone(msg.guild.configs.spawn.config.split(",")) : msg.channel.id;

        let channelSelected;

        try {
            // Fetch selected Channel
            channelSelected = msg.guild.channels.cache.get(channelToRedirectTo) || await msg.guild.channels.fetch(channelToRedirectTo);

            // Break if doesn't exist
            if (!channelSelected) break spawnIF;

            // Reassign for newly selected Channel
            if (!channelSelected.spawn) channelSelected.spawn = { count: chance.integer({ min: 30, max: 140 }), pokemon: {}, lastSpawn: Date.now() };

            // Initializing New Pokemon
            channelSelected.spawn.pokemon = new Pokedex({});
            // Spawn Pokemon Execution
            await channelSelected.spawn.pokemon.SpawnFriendlyV2();
            // Send Spawn
            await channelSelected.spawn.pokemon.spawnToChannel(channelSelected);
        } catch (err) {
            break spawnIF;
        };
    }

    if (!msg.author.count) msg.author.count = { levelUp: 0, pokemonLevelUpCount: chance.integer({ min: 40, max: 300 }) };

    if (msg.author.player && msg.author.player.started) {
        if (randomint(10000) < 20) {
            if (await msg.author.player.levelUp(msg.client.postgres))
                msg.channel.send("Congrats on being Level " + msg.author.player.level + ", Champ.");
        }

        if (--msg.author.count.pokemonLevelUpCount <= 0) {

            msg.author.count.pokemonLevelUpCount = chance.integer({ min: 40, max: 300 });

            const checkStats = await msg.author.player.pokemonLevelUp(msg.client.postgres, msg);

            if (checkStats) {
                if (checkStats.hasEvolved) return msg.reply(`Congratulations! Your ${capitalize(checkStats.pokemon)} has evolved to ${capitalize(checkStats.evolvedPokemon)}!`);
                if (checkStats.levelIncreased) return msg.reply(`Congratulations! Your ${capitalize(checkStats.pokemon)} is now level ${checkStats.level}!`);
            }
        }
    }

    return true;
}

export default messageCreate;