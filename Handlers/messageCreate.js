import Chance from "chance";
// import Player from "../Classes/player.js";
import randomint from "../Utilities/Misc/randomint.js";
import capitalize from "../Utilities/Misc/capitalize.js";
import Pokedex from "../Classes/pokedex.js";
import setMessageCache from "../Utilities/Misc/setMessageCache.js";
import { logCustomReport } from "../Utilities/User/logReport.js";
import { delayFor } from "discord-hybrid-sharding";
import i18n from "i18n";
import localeMapping from "../Utilities/Misc/localeMapping.js";

const chance = Chance();

async function messageCreate(msg, e) {

    // if (msg.author && msg.author.id != process.env.BOTID && msg.content)
    //     return logCustomReport({ command: 200, user_id: msg.author.id, channel: msg.channel.id, guild: msg.guild.id, value: JSON.stringify({ content: msg.content, embeds: msg.embeds }) });

    if (!msg.guild || (msg.member && msg.member.user.bot))
        return;

    await setMessageCache(msg);

    // Message Content Handler for Commands that are Bot Pinged
    if (msg.mentions.has(msg.client.user)) {

        // Check if the bot was pinged at the beginning of the message
        if (msg.content.startsWith(`<@${msg.client.user.id}> `) || msg.content.startsWith(`<@!${msg.client.user.id}> `)) {
            // Bot was pinged at the beginning of the message

            // Command Name (allegedly)
            const [, , rest] = msg.content.split(/^(<[@!]+\d{15,}>)\s/gmi);
            const [commandName, ...textParts] = rest.trim().split(" ");
            const text = textParts.join(" ");

            // If Command Found, Run it
            if (msg.client.commands.get(commandName)?.mention_support) {

                // Directly modify msg to add/override properties
                Object.defineProperty(msg, "user", {
                    get() { return msg.author; },
                    set(val) { msg.author = val; },
                    configurable: true,
                    enumerable: true
                });

                msg.reply = function (options) {
                    // If options is an object and has 'ephemeral', remove it
                    if (options && typeof options === "object" && "ephemeral" in options) {
                        const { ephemeral, ...rest } = options;
                        // For those reading this and don't know what "getPrototypeOf" does, it basically allows me to use the original Reply function from the Message class
                        return Object.getPrototypeOf(msg).reply.call(this, rest);
                    }
                    return Object.getPrototypeOf(msg).reply.call(this, options);
                };

                msg.isMessage = true;

                msg.content = text;

                msg.client.commands.get(commandName)(msg);

            }

        }

    }

    // Spawn System
    if (!msg.channel.spawn || isNaN(msg.channel.spawn.count)) msg.channel.spawn = { count: chance.integer({ min: 25, max: 50 }), pokemon: {}, lastSpawn: Date.now() };

    // Decrementing Count for Spawn
    msg.channel.spawn.count--;

    // Spawn 
    spawnIF: if (msg.channel.spawn.count < 0 && Date.now() - msg.channel.spawn.lastSpawn > (1000 * 60 * 2)) {
        // Reassignment
        msg.channel.spawn.count = chance.integer({ min: 25, max: 50 });
        msg.channel.spawn.lastSpawn = Date.now();

        // Check if spawns are disabled in the current channel
        if (msg.channel.configs?.spawn_disabled?.config === "true") break spawnIF;

        // Determine the target channel for the spawn
        const redirectConfig = msg.guild?.configs?.spawn_redirect?.config;
        const targetChannelId = redirectConfig ? chance.pickone(redirectConfig.split(",")) : msg.channel.id;

        let channelSelected;

        try {
            // Fetch selected Channel
            channelSelected = msg.guild.channels.cache.get(targetChannelId) || await msg.guild.channels.fetch(targetChannelId);

            // Break if channel doesn't exist or is invalid or is not permitted to send a message there
            if (!channelSelected || !channelSelected.isTextBased() || !channelSelected.permissionsFor(msg.client.user)?.has("SendMessages")) break spawnIF;

            // If we redirected, we must also check if the target channel has spawns disabled
            if (targetChannelId !== msg.channel.id) {
                const targetChannelInfo = (await msg.client.postgres`SELECT * FROM command_configuration WHERE channel_id = ${targetChannelId} AND command = 'spawn_disabled' LIMIT 1`)?.[0];
                if (targetChannelInfo?.config === "true") break spawnIF;
            }

            // Reassign for newly selected Channel
            if (!channelSelected.spawn) channelSelected.spawn = { count: chance.integer({ min: 30, max: 140 }), pokemon: {}, lastSpawn: Date.now() };

            // Initializing New Pokemon
            channelSelected.spawn.pokemon = new Pokedex();

            // Spawn Pokemon Execution
            await channelSelected.spawn.pokemon.SpawnFriendlyV2();

            i18n.setLocale(localeMapping(msg.channel?.configs?.locale?.config || msg.guild?.configs?.locale?.config || msg.guild.preferredLocale || "en"));

            // Send Spawn
            await channelSelected.spawn.pokemon.spawnToChannel(channelSelected, msg.client.commands.get("catch")?.rest?.id);

        } catch (err) {
            console.error("Error during spawn:", err);
            break spawnIF;
        };
    }

    if (!msg.author.count) msg.author.count = { pokemonLevelUpCount: chance.integer({ min: 40, max: 300 }) };

    if (msg.author.player && msg.author.player.started) {

        i18n.setLocale(localeMapping(msg.author?.player?.locale || msg.channel?.configs?.locale?.config || msg.guild?.configs?.locale?.config || msg.guild.preferredLocale || "en"));

        // Slow down User Level-Up
        if (randomint(1000) < 20) {
            if (await msg.author.player.levelUp(msg.client.postgres))
                msg.channel.send(i18n.__('user.levelup', { level: msg.author.player.level })), logCustomReport({ command: 103, user_id: msg.author.id, channel: msg.channel.id, guild: msg.guild.id, shortval: msg.author.player.level.toString() });
        }

        if (--msg.author.count.pokemonLevelUpCount <= 0) {

            msg.author.count.pokemonLevelUpCount = chance.integer({ min: 40, max: 300 });

            const checkStats = await msg.author.player.pokemonLevelUp(msg.client.postgres, msg);

            if (checkStats) {
                logCustomReport({ command: 102, user_id: msg.author.id, channel: msg.channel.id, guild: msg.guild.id, value: JSON.stringify(checkStats) });
                if (checkStats.hasEvolved) return msg.reply(i18n.__('user.pokemon_evolved', { pokemon: capitalize(checkStats.pokemon), evolved: capitalize(checkStats.evolvedPokemon) }));
                if (checkStats.levelIncreased) return msg.reply(i18n.__('user.pokemon_levelup', { pokemon: capitalize(checkStats.pokemon), level: checkStats.level }));
            }
        }

        if (msg.author.player.hatchery?.length) {
            for (const nest of msg.author.player.hatchery) {
                const egg = await nest.shake();
                if (egg) {
                    const m = await msg.reply({ content: i18n.__('user.something_happening_to_egg'), withResponse: true });
                    await delayFor(1500);
                    await m.resource.message.edit(i18n.__('user.could_it_be'));
                    await delayFor(1500);
                    await m.resource.message.edit(i18n.__('user.egg_hatched', { pokemon: capitalize(egg.pokemon, true) }));
                };
            }
        }
    }

    return true;
}

export default messageCreate;
