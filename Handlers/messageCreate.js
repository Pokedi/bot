import Chance from "chance";
import Player from "../Classes/player.js";
import randomint from "../Utilities/Misc/randomint.js";
import capitalize from "../Utilities/Misc/capitalize.js";
import Pokedex from "../Classes/pokedex.js";
import setMessageCache from "../Utilities/Misc/setMessageCache.js";
import { logCustomReport } from "../Utilities/User/logReport.js";
import { delayFor } from "discord-hybrid-sharding";

const chance = Chance();

async function messageCreate(msg, e) {

    // if (msg.author && msg.author.id != process.env.BOTID && msg.content)
    //     return logCustomReport({ command: 200, user_id: msg.author.id, channel: msg.channel.id, guild: msg.guild.id, value: JSON.stringify({ content: msg.content, embeds: msg.embeds }) });

    if (!msg.guild || (msg.member && msg.member.user.bot))
        return;

    await setMessageCache(msg);

    // Message Content Handler for Commands that are Bot Pinged
    if (msg.mentions.has(msg.client.user)) {

        console.log("> Mentioned: ", msg.content);

        // Check if the bot was pinged at the beginning of the message
        if (msg.content.startsWith(`<@${msg.client.user.id}> `) || msg.content.startsWith(`<@!${msg.client.user.id}> `)) {
            // Bot was pinged at the beginning of the message

            // Command Name (allegedly)
            const [commandName, text] = msg.content.split(/^(<[@!]+\d{15,}>)\s/gmi)[2].trim().split(" ");

            // If Command Found, Run it
            if (msg.client.commands.get(commandName)?.mention_support) {
                const tempMsg = new Proxy(msg, {
                    get(target, prop) {
                        if (prop === "user") return target.author;
                        if (prop === "reply") {
                            return function (options) {
                                // If options is an object and has 'ephemeral', remove it
                                if (options && typeof options === "object" && "ephemeral" in options) {
                                    const { ephemeral, ...rest } = options;
                                    return target.reply(rest);
                                }
                                return target.reply(options);
                            };
                        }
                        return target[prop];
                    },
                    set(target, prop, value) {
                        if (prop === "user") return true; // Prevent modification
                        target[prop] = value;
                        return true;
                    }
                });
                msg.client.commands.get(commandName)(tempMsg);
            }

        }

    }

    // Spawn System
    if (!msg.channel.spawn) msg.channel.spawn = { count: chance.integer({ min: 10, max: 30 }), pokemon: {}, lastSpawn: Date.now() };

    // Decrementing Count for Spawn
    msg.channel.spawn.count--;

    // Spawn 
    spawnIF: if (msg.channel.spawn.count < 0 && Date.now() - msg.channel.spawn.lastSpawn > (1000 * 60 * 2)) {
        // Reassignment
        msg.channel.spawn.count = chance.integer({ min: 10, max: 30 });
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
            await channelSelected.spawn.pokemon.spawnToChannel(channelSelected, msg.client.commands.get("catch")?.rest?.id);
        } catch (err) {
            break spawnIF;
        };
    }

    if (!msg.author.count) msg.author.count = { playerLevelUpCount: randomint(1000) < 20, pokemonLevelUpCount: chance.integer({ min: 40, max: 300 }) };

    if (msg.author.player && msg.author.player.started) {

        // Slow down User Level-Up
        if (randomint(1000) < 20) {
            if (await msg.author.player.levelUp(msg.client.postgres))
                msg.channel.send("Congrats on being Level " + msg.author.player.level + ", Champ."), logCustomReport({ command: 103, user_id: msg.author.id, channel: msg.channel.id, guild: msg.guild.id, shortval: msg.author.player.level.toString() });
        }

        if (--msg.author.count.pokemonLevelUpCount <= 0) {

            msg.author.count.pokemonLevelUpCount = chance.integer({ min: 40, max: 300 });

            const checkStats = await msg.author.player.pokemonLevelUp(msg.client.postgres, msg);

            if (checkStats) {
                logCustomReport({ command: 102, user_id: msg.author.id, channel: msg.channel.id, guild: msg.guild.id, value: JSON.stringify(checkStats) });
                if (checkStats.hasEvolved) return msg.reply(`Congratulations! Your ${capitalize(checkStats.pokemon)} has evolved to ${capitalize(checkStats.evolvedPokemon)}!`);
                if (checkStats.levelIncreased) return msg.reply(`Congratulations! Your ${capitalize(checkStats.pokemon)} is now level ${checkStats.level}!`);
            }
        }

        if (msg.author.player.hatchery?.length) {
            for (const nest of msg.author.player.hatchery) {
                const egg = await nest.shake();
                if (egg) {
                    const m = await msg.reply({ content: "Something's happening to your egg!", fetchReply: true });
                    await delayFor(1500);
                    await m.edit("Could it be!");
                    await delayFor(1500);
                    await m.edit(`Your egg hatched into a ${capitalize(egg.pokemon, true)}!`);
                };
            }
        }
    }

    return true;
}

export default messageCreate;
