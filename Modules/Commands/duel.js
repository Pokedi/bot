import { EmbedBuilder, InteractionCollector, InteractionType, MessageFlags, SlashCommandBuilder } from "discord.js";
import Player from "../../Classes/player.js";
import { returnEmbedBox, updateEmbedBox } from "../../Utilities/Pokemon/pokemonBattleImage.js";

import pkg from 'pokemon-showdown'; // Need Teams here for Teams.pack
const { Teams, BattleStream, getPlayerStreams, toID } = pkg;

import pkdex from "../../node_modules/pokemon-showdown/dist/data/pokedex.js"
import { ENUM_POKEMON_FULL_TYPES_ID } from "../../Utilities/Data/enums.js";
import capitalize from "../../Utilities/Misc/capitalize.js";
const { Pokedex } = pkdex;

export function convertPokemonInstancesToPSTeam(pokemonInstances, battleFormat = '6v6') {
    const teamSizeMap = {
        '1v1': 1,
        '2v2': 2,
        '3v3': 3,
        '6v6': 6,
    };
    const requiredTeamSize = teamSizeMap[battleFormat];

    // Ensure the team doesn't exceed the required size for the battle format
    pokemonInstances = pokemonInstances.slice(0, requiredTeamSize);

    // Convert each PokemonInstance to a PokemonSet object
    const pokemonSets = pokemonInstances.map(instance => pokemonInstanceToPokemonSet(instance));

    // Use Teams.pack to convert the array of PokemonSet objects into the single packed string
    return Teams.pack(pokemonSets);
}

function pokemonInstanceToPokemonSet(instance) {
    // Moves are converted to their IDs (lowercase, alphanumeric) and filtered to ensure no empty strings
    const moves = instance.moves
        .filter(Boolean)
        .map((move) => (move).toLowerCase().replace(/[^a-z0-9]+/g, ''));

    // Effort Values (EVs) - use 0 if not provided
    const evs = {
        hp: instance.e_hp ?? 0,
        atk: instance.e_atk ?? 0,
        def: instance.e_def ?? 0,
        spa: instance.e_spatk ?? 0,
        spd: instance.e_spdef ?? 0,
        spe: instance.e_spd ?? 0,
    };

    // Individual Values (IVs) - default to 31 if not provided
    const ivs = {
        hp: instance.s_hp ?? 31,
        atk: instance.s_atk ?? 31,
        def: instance.s_def ?? 31,
        spa: instance.s_spatk ?? 31,
        spd: instance.s_spdef ?? 31,
        spe: instance.s_spd ?? 31,
    };

    // Species name must be its ID (lowercase, alphanumeric)
    const speciesName = instance.pokemon.toLowerCase().replace(/[^a-z0-9]+/g, '');
    // Nickname is optional, defaults to species name
    const nickname = instance.name || instance.pokemon;

    const pokemonSet = {
        name: nickname,
        species: speciesName,
        item: instance.item ? instance.item.toLowerCase().replace(/[^a-z0-9]+/g, '') : '', // Item to ID
        ability: '', // Ability is often auto-selected by PS if left empty, or can be explicitly set if known
        moves: moves,
        nature: instance.nature || 'Serious',
        evs: evs,
        ivs: ivs,
        gender: instance.gender || "M", // M, F, or undefined
        shiny: instance.shiny || undefined,
        level: instance.level || 100,
        // The following fields are part of a full PokemonSet but are not present in your PokemonInstance headers.
        // They are left as undefined and won't be included in the packed string unless explicitly added/mapped.
        happiness: undefined,
        pokeball: undefined,
        hpType: undefined,
        gigantamax: undefined,
        dynamaxLevel: undefined,
        teraType: undefined,
    };

    return pokemonSet;
}

// BattleTextParser I ripped outta the PokemonShowdown Client
import { BattleTextParser } from "../../Utilities/Pokemon/battleTextParser.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('duel')
        .setDescription('Let er Rip! Oh wait, wrong one, AUTOBOTS! ROLLOUT!')
        .addSubcommand(x =>
            x.setName('start')
                .setDescription('Use this command to start your battle')
                .addUserOption(x =>
                    x.setName('opponent-1')
                        .setDescription("Mention your Opponent if you Dare!")
                        .setRequired(true)
                )
                .addUserOption(x =>
                    x.setName('opponent-2')
                        .setDescription("Only available if GameMode is Multiplayer [Coming Soon]")
                )
                .addUserOption(x =>
                    x.setName('ally')
                        .setDescription("Only available if GameMode is Multiplayer [Coming Soon]")
                )
                .addBooleanOption(x =>
                    x.setName('multiplayer')
                        .setDescription("Multiplayer 2v2 [Coming Soon]")
                )
        )
        .addSubcommand(x =>
            x.setName('actions')
                .setDescription('Actions include attacking, switching, healing, and what not.')
                .addNumberOption(x =>
                    x.setName('attack')
                        .setDescription('Attack Move')
                        .setMaxValue(4)
                        .setMinValue(1)
                )
                .addStringOption(x =>
                    x.setName('switch')
                        .setDescription('Switch your Pokemon')
                        .setAutocomplete(true)
                )
                .addNumberOption(x =>
                    x.setName('target')
                        .setDescription('Target of the Attack')
                        .addChoices(
                            { name: 'Auto', value: 0 },
                            { name: 'Opponent 1', value: 1 },
                            { name: 'Opponent 2', value: 2 },
                            { name: 'Ally', value: 3 }
                        )
                )
                .addBooleanOption(x =>
                    x.setName('mega')
                        .setDescription('Mega Evolve your Pokemon [Coming Soon]')
                )
                .addBooleanOption(x =>
                    x.setName('gmax')
                        .setDescription('Gmax Evolve your Pokemon [Coming Soon]')
                )
                .addBooleanOption(x =>
                    x.setName('run-away')
                        .setDescription('Run away!')
                )
        )
        .addSubcommand(x =>
            x.setName('view')
                .setDescription('View Details on the Duel, User, etc.')
                .addBooleanOption(x =>
                    x.setName('team')
                        .setDescription('View your Team')
                )
                .addBooleanOption(x =>
                    x.setName('moves')
                        .setDescription('Check out your available moves')
                )
        ),
    async execute(msg) {

        // Check if Player is ready
        if (!msg.user.player || !msg.user.player.started)
            return msg.reply("You haven't started your adventure! `/pick` someone to travel with!");

        // Create Player if not exists
        if (!msg.user.player)
            msg.user.player = new Player({ id: msg.user.id });

        // Execute the command based on subcommand
        switch (msg.options.getSubcommand()) {
            case 'start': {

                const opponent1 = msg.options.getUser('opponent-1');
                const opponent2 = msg.options.getUser('opponent-2');
                const ally = msg.options.getUser('ally');
                const multiplayer = msg.options.getBoolean('multiplayer') || false;

                // Start the battle
                const player = msg.user.player;

                await msg.deferReply();

                await player.fetchPokemon(msg.client.postgres, true);

                const opponent = new Player({ id: opponent1 });

                await opponent.fetch(msg.client.postgres);

                if (!opponent.started) return msg.editReply("The opponent hasn't started their adventure yet!");

                if (!opponent.selected || !opponent.selected[0])
                    return msg.editReply("The opponent has no Pokemon selected for battle!");

                await opponent.fetchPokemon(msg.client.postgres, true);

                // Check if Opponent Pokemon were fetched
                if (!opponent.pokemon || !opponent.pokemon.length)
                    return msg.editReply("The opponent has no Pokemon selected for battle!");

                player.readyBattleMode();
                player.globalName = msg.user.username;
                for (const pk of player.pokemon) {
                    await pk.readyBattleMode();
                    await pk.readyBattleImage();

                    // Check if the Pokemon is valid
                    if (!Pokedex[toID(pk.pokemon)]) {
                        // return msg.reply(`Your Pokemon ${toID(pk.pokemon)} is not valid for battle!`);
                        Pokedex[toID(pk.pokemon)] = {
                            num: pk.pokedex.id,
                            name: capitalize(pk.pokedex.name),
                            types: pk.pokedex.types.map(x => ENUM_POKEMON_FULL_TYPES_ID[x]),
                            baseStats: { hp: pk.pokedex.hp, atk: pk.pokedex.atk, def: pk.pokedex.def, spa: pk.pokedex.spatk, spd: pk.pokedex.spdef, spe: pk.pokedex.spd },
                            abilities: {},
                            heightm: pk.pokedex.height,
                            weightkg: pk.pokedex.weight,
                            color: "Colorless",
                            // prevo: ,
                            // evoLevel: 32,
                            eggGroups: [],
                            otherFormes: [],
                            formeOrder: [],
                            canGigantamax: ""
                        }
                    }
                }

                opponent.readyBattleMode();
                opponent.globalName = opponent1.username;
                for (const pk of opponent.pokemon) {
                    await pk.readyBattleMode();
                    await pk.readyBattleImage();

                    if (!Pokedex[toID(pk.pokemon)]) {
                        // return msg.reply(`Your Pokemon ${toID(pk.pokemon)} is not valid for battle!`);
                        Pokedex[toID(pk.pokemon)] = {
                            num: pk.pokedex.id,
                            name: capitalize(pk.pokedex.name),
                            types: pk.pokedex.types.map(x => ENUM_POKEMON_FULL_TYPES_ID[x]),
                            baseStats: { hp: pk.pokedex.hp, atk: pk.pokedex.atk, def: pk.pokedex.def, spa: pk.pokedex.spatk, spd: pk.pokedex.spdef, spe: pk.pokedex.spd },
                            abilities: {},
                            heightm: pk.pokedex.height,
                            weightkg: pk.pokedex.weight,
                            color: "Colorless",
                            // prevo: ,
                            // evoLevel: 32,
                            eggGroups: [],
                            otherFormes: [],
                            formeOrder: [],
                            canGigantamax: ""
                        }
                    }
                }

                // Have both players in Battle State
                await player.setOnGoingDuels(msg.client.redis, msg.id);
                await opponent.setOnGoingDuels(msg.client.redis, msg.id);

                let battleMessage;

                const battleId = 'bt-' + player.id;
                const battleStream = new BattleStream({});

                const streams = getPlayerStreams(battleStream);

                const formatid = `gen9customgame@${'6v6'}`;

                // Battle will only go on for 5 minutes
                const battleTimeout = setTimeout(() => {
                    if (!streams.omniscient.atEOF)
                        streams.omniscient.destroy();
                    msg.followUp("Battle ended due to inactivity or timeout.");
                    player.removeDuelsState(msg.client.redis);
                    opponent.removeDuelsState(msg.client.redis);
                    // battleMessage.resource.edit({ content: "Battle ended due to inactivity or timeout.", embeds: [], components: [] });
                }, 5 * 60 * 1000);

                const parser = new BattleTextParser();

                const battleInteractionCollector = new InteractionCollector(msg.client, {
                    channel: msg.channel,
                    interactionType: InteractionType.ApplicationCommand,
                    filter: x => x.commandName == "duel" && [player.id, opponent.id].includes(x.user.id),
                    time: 10 * 60000
                });

                let FirstMessage = 0;

                let storedLogs = [];

                async function sendFirstMessage() {

                    if (FirstMessage == 2)
                        return;

                    FirstMessage++;

                    if (FirstMessage == 2) {
                        if (!battleMessage) {
                            battleMessage = await msg.editReply(await returnEmbedBox(player, opponent));
                        }
                    }
                }

                void (async () => {

                    try {

                        for await (const chunk of streams.p1) {

                            if (chunk.includes('request')) {
                                player.battle.request = JSON.parse(chunk.split("request|")[1]);
                                player.battle.activePokemon = player.battle.request.side.pokemon.map((x, y) => ({ ...x, id: y })).find(x => x.active);
                                player.battle.selected = player.battle.activePokemon.id;
                                const parts = player.battle.activePokemon.condition.split(" ");
                                const [current_hp, max_hp] = parts[0].split("/").map(Number);
                                const status = parts[1] || null;
                                player.pokemon[player.battle.selected] = { ...player.pokemon[player.battle.selected], current_hp, max_hp, status };
                                sendFirstMessage();
                            }

                        }

                    } catch (error) {
                        console.log(error);
                    }

                })();

                void (async () => {

                    try {

                        for await (const chunk of streams.p2) {

                            if (chunk.includes('request')) {
                                opponent.battle.request = JSON.parse(chunk.split("request|")[1]);
                                opponent.battle.activePokemon = opponent.battle.request.side.pokemon.map((x, y) => ({ ...x, id: y })).find(x => x.active);
                                opponent.battle.selected = opponent.battle.activePokemon.id;
                                const parts = opponent.battle.activePokemon.condition.split(" ");
                                const [current_hp, max_hp] = parts[0].split("/").map(Number);
                                const status = parts[1] || null;
                                opponent.pokemon[opponent.battle.selected] = { ...opponent.pokemon[opponent.battle.selected], current_hp, max_hp, status };
                                sendFirstMessage();
                            }

                        }

                    } catch (error) {
                        console.log(error);
                    }

                })();

                // Track Image Changes - Dirty, I know
                let imageChange = false;

                void (async () => {

                    try {

                        for await (const chunk of streams.omniscient) {
                            if (typeof chunk === 'string') {
                                // msg.followUp(parser.extractMessage(chunk));
                                if (chunk.includes('|win|')) {
                                    // streams.omniscient.destroy();
                                    player.removeDuelsState(msg.client.redis);
                                    opponent.removeDuelsState(msg.client.redis);
                                    battleInteractionCollector.stop();
                                    break;
                                }

                                if (battleMessage && chunk.includes('|turn|')) {
                                    storedLogs.push(chunk.split("\n").map(x => parser.extractMessage(x)).filter((x) => x.length > 3).join("\n").substring(0, 1024) || "The battle rages on!");
                                    // FirstMessage = 0;

                                    const embedData = await returnEmbedBox(player, opponent, !imageChange, battleMessage.files);
                                    imageChange = false;
                                    embedData.embeds[0].fields.push({
                                        name: "Battle Log",
                                        value: storedLogs.join("\n")
                                    });

                                    storedLogs = [];
                                    battleMessage = await msg.channel.send(embedData);

                                }
                            }
                        }

                    } catch (error) {
                        console.log(`Error reading stream for battle ${battleId}`, error);
                    }

                })();

                player.pokemon = player.pokemon.map((x, y) => { x.name = `${x.pokemon}(${x.idx})`; x.i = y; return x; });
                opponent.pokemon = opponent.pokemon.map((x, y) => { x.name = `${x.pokemon}(${x.idx})`; x.i = y; return x; });

                streams.omniscient.write(`>start {"formatid":"${formatid}", "gametype": "singles"}\n` +
                    // `>gametype singles\n` +
                    `>player p1 ${JSON.stringify({ name: player.globalName, team: (convertPokemonInstancesToPSTeam(player.pokemon)) })}\n` +
                    `>player p2 ${JSON.stringify({ name: opponent.globalName, team: (convertPokemonInstancesToPSTeam(opponent.pokemon)) })}\n` +
                    `>p1 team 123456\n` +
                    `>p2 team 123456\n`)

                battleInteractionCollector.on('collect', async m => {

                    const id = BigInt(m.user.id);

                    const currentPlayer = id == player.id ? player : opponent;

                    const playerKey = id == player.id ? 'p1' : 'p2';

                    switch (m.options.getSubcommand()) {

                        case 'actions': {
                            const attack = m.options.getNumber('attack');
                            const switchPk = m.options.getString('switch');
                            const runAway = m.options.getBoolean('run-away');

                            if (runAway) {
                                await m.reply('Okay, you lost.');
                                return streams.omniscient.write('>forcewin ' + (playerKey == "p1" ? "p2" : "p1"));
                            }
                            // return player.removeDuelsState(msg.client.redis),
                            //     opponent.removeDuelsState(msg.client.redis), m.reply('You have ended the match and lost miserably.');

                            // const target = msg.options.getInteger('target');

                            if (!attack && !switchPk) return m.reply({ content: 'You must choose an action: either to attack or to switch.', ephemeral: true });
                            if (attack && switchPk) return m.reply({ content: 'You can only choose one action per turn: either attack or switch.', ephemeral: true });
                            let choice = '';
                            if (attack) {

                                let targetString = '';

                                // This seems complicated so I'll leave it for Future Me                                
                                // if (target) {
                                //     switch (target) {
                                //         case 1: targetString = ' +1'; break; // Opponent 1
                                //         case 2: targetString = ' +2'; break; // Opponent 2
                                //         case 3: targetString = ' -2'; break; // Ally (assumes targeting partner)
                                //     }
                                // }
                                choice = `move ${attack}${targetString}`; // ${mega}${gmax}
                            } else if (switchPk) {
                                choice = `switch ${switchPk}`;
                                currentPlayer.battle.selected = currentPlayer.pokemon.find(x => x.name == switchPk).i;
                                imageChange = true;
                            }

                            streams[playerKey].write(choice);
                            return m.reply({ content: "Move Registered", flags: MessageFlags.Ephemeral });
                        }
                        // view case with status support
                        case "view": {
                            const moves = m.options.getBoolean('moves');
                            const team = m.options.getBoolean('team');

                            if (moves) {
                                const active = currentPlayer.battle.request.active[0];
                                const name = currentPlayer.battle.activePokemon.ident.split(': ')[1];

                                const embed = new EmbedBuilder()
                                    .setTitle(`${name}'s Moves`)
                                    .setFooter({
                                        text: 'Power Points (PP) have been enabled to improve the experience and challenge between users.'
                                    })
                                    .addFields(
                                        active.moves.map(x => ({
                                            name: x.move,
                                            value: `**PP**: ${x.pp} / ${x.maxpp}`,
                                            inline: true
                                        }))
                                    )
                                    .setColor('DarkGold');

                                return m.reply({ embeds: [embed] });
                            }

                            if (team) {
                                const side = currentPlayer.battle.request.side;
                                const embed = new EmbedBuilder()
                                    .setTitle(`${side.name}'s Team`)
                                    .setColor('DarkBlue')
                                    .addFields(
                                        side.pokemon.map(poke => {
                                            const [hpPart, status] = poke.condition.split(" ");
                                            const [current_hp, max_hp] = hpPart.split("/");

                                            return {
                                                name: poke.ident.split(": ")[1],
                                                value:
                                                    `**HP**: ${current_hp} / ${max_hp}` +
                                                    (status ? `\n**Status**: ${status.toUpperCase()}` : '') +
                                                    `\n**Level & Gender**: ${poke.details}` +
                                                    `\n**Ability**: ${poke.ability || "Unknown"}`,
                                                inline: false
                                            };
                                        })
                                    );

                                return m.reply({ embeds: [embed] });
                            }
                        }


                    }

                });

                return;

            }
            // case 'actions':
            // case 'view':
            // default:
            //     return msg.reply("Unknown subcommand.");
        }

    }
}