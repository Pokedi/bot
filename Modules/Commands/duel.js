import { ComponentType, InteractionCollector, InteractionType, SlashCommandBuilder } from "discord.js";
import buttonVerification from "../../Utilities/Core/buttonVerification.js";
import removeDuplicates from "../../Utilities/Misc/removeDuplicates.js";
import Player from "../../Classes/player.js";
import { battleBoxFields, generateBattleBox, returnBattleBox, returnEmbedBox, returnNewFieldEmbed } from "../../Utilities/Pokemon/pokemonBattleImage.js";
import capitalize from "../../Utilities/Misc/capitalize.js";
import Color from "color";
import calculateModifier from "../../Utilities/Pokemon/calculateModifier.js";
import randomint from "../../Utilities/Misc/randomint.js";
import damageMultiplier from "../../Utilities/Pokemon/damageMultiplier.js";
import { Chance } from "chance";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .addSubcommand(x => x
            .setName("start")
            .setDescription("Setup for Duels")
            .addMentionableOption(x => x
                .setName("vs-user-1")
                .setDescription("User 1 you will battle against [Required]")
            )
            .addMentionableOption(x => x
                .setName("vs-user-2")
                .setDescription("User 2 you will battle against")
            )
            .addMentionableOption(x => x
                .setName("vs-user-3")
                .setDescription("User 3 you will battle against")
            )

            .addMentionableOption(x => x
                .setName("2-user-vs")
                .setDescription("User 2 you will battle with")
            )
            .addMentionableOption(x => x
                .setName("3-user-vs")
                .setDescription("User 3 you will battle with")
            )
        )
        .addSubcommand(x => x
            .setName("actions")
            .setDescription("Choose to attack, defend, or switch! Heck, run away.")
            .addIntegerOption(y => y
                .setName("attack")
                .setDescription("Choose what you plan to attack with! Check out /duel moves to see what's Available")
                .setMaxValue(4)
                .setMinValue(1)
                .setChoices({ name: "First Attack", value: 1 }, { name: "Second Attack", value: 2 }, { name: "Third Attack", value: 3 }, { name: "Forth Attack", value: 4 })
            )
            .addIntegerOption(y => y
                .setName("attack-user")
                .setDescription("What user are you attacking? [Default 1]")
                .setMaxValue(3)
                .setMinValue(1)
            )
            .addIntegerOption(y => y
                .setName("switch")
                .setDescription("Choose what Pokemon you want to switch out")
                .setMaxValue(6)
                .setMinValue(1)
                .setChoices({ name: "First Pokemon", value: 1 }, { name: "Second Pokemon", value: 2 }, { name: "Third Pokemon", value: 3 }, { name: "Forth Pokemon", value: 4 }, { name: "Fifth Pokemon", value: 5 }, { name: "Sixth Pokemon", value: 6 })
            )
            .addIntegerOption(y => y
                .setName('berry')
                .setDescription("Use a Berry!")
                .addChoices({
                    name: "Pecha Berry",
                    value: 1
                })
            )
            .addIntegerOption(y => y
                .setName('potion')
                .setDescription("Use a Potion!")
                .addChoices({
                    name: "Potion",
                    value: 1
                })
            )
            .addIntegerOption(y => y
                .setName('pokeball')
                .setDescription("Throw out a Pokeball!")
                .addChoices({
                    name: "Pokeball",
                    value: 1
                })
            )
            .addBooleanOption(y => y
                .setName("run-away")
                .setDescription("Run away!!!!")
            )
            .addBooleanOption(y => y
                .setName("dyna-giga")
                .setDescription("Giga/Dyna Max your Pokemon")
            )
        )
        .addSubcommand(x => x
            .setName("moves")
            .setDescription("Check your Pokemon's moves")
        )
        .addSubcommand(x => x
            .setName("team")
            .setDescription("Check your Pokemons!")
        )
        .setName('duel')
        .setDescription('Admin command'),
    async execute(msg) {

        // if (msg.user.id != "688446585524584502") return await msg.reply("Yeah, this is currently being remade");

        if (msg.options.getSubcommand() != "start")
            return true;

        if (msg.options.getBoolean("run-away"))
            return await msg[msg.replied ? "followUp" : "reply"]({ ephemeral: true, content: "Please wait 5-10 minutes till you can use this." });

        const teamAIDs = removeDuplicates([msg.user.id, msg.options.getUser('2-user-vs'), msg.options.getUser('3-user-vs')]).filter(x => x);
        const teamBIDs = removeDuplicates([msg.options.getUser('vs-user-1'), msg.options.getUser('vs-user-2'), msg.options.getUser('vs-user-3')]).filter(x => x);

        if (!teamAIDs.length || !teamBIDs.length)
            return await msg.reply("You need to mention a specified number of players");

        if (teamAIDs.find(x => teamBIDs.includes(x)) || teamBIDs.find(x => teamAIDs.includes(x)))
            return await msg.reply("You cannot have the same members on both sides.");

        const verification = await buttonVerification({ interaction: msg, users: [msg.user].concat(teamAIDs, teamBIDs).filter(x => x && x.id).map(x => x.id) });

        if (!verification) return await msg.followUp("First Phase Failed");

        const teamAConstructs = removeDuplicates(teamAIDs).map(x => new Player({ id: BigInt(x) }));
        const teamBConstructs = removeDuplicates(teamBIDs).map(x => new Player({ id: BigInt(x) }));

        // Fetch Details
        for (const member of teamAConstructs) {
            // Is Dueling?
            if (await member.isInDuel(msg.client.redis))
                return await msg.followUp(`<@${member.id}> is currently in a duel right now...`);

            // Is Trading
            if (await member.isTrading(msg.client.redis))
                return await msg.followUp(`<@${member.id}> is currently in a trade right now...`);

            await member.fetch(msg.client.postgres);
            member.username = msg.client.users.cache.get(member.id)?.username;
            member.globalName = msg.client.users.cache.get(member.id)?.globalName;
            // Set Duel state
            await member.setOnGoingDuels(msg.client.redis, msg.id);
        }

        for (const member of teamBConstructs) {
            // Is Dueling?
            if (await member.isInDuel(msg.client.redis))
                return await msg.followUp(`<@${member.id}> is currently in a duel right now...`);

            // Is Trading
            if (await member.isTrading(msg.client.redis))
                return await msg.followUp(`<@${member.id}> is currently in a trade right now...`);

            await member.fetch(msg.client.postgres);
            member.username = msg.client.users.cache.get(member.id)?.username;
            member.globalName = msg.client.users.cache.get(member.id)?.globalName;
            // Set Duel state
            await member.setOnGoingDuels(msg.client.redis, msg.id);
        }

        if (teamAConstructs.find(x => !x.selected.length) || teamBConstructs.find(x => !x.selected.length))
            return await msg.followUp("One of the players does not have a Pokemon selected.");

        // Ready Teams
        const teamA = Object.assign(...teamAConstructs.map(x => ({ [x.id]: x })));
        const teamB = Object.assign(...teamBConstructs.map(x => ({ [x.id]: x })));

        for (const member in teamA) {
            await teamA[member].fetchPokemon(msg.client.postgres);
            if (!teamA[member].pokemon.length) return await msg.followUp("Duel cancelled, <@" + member + "> does not have any Pokemon selected");
            teamA[member].readyBattleMode();
            if (teamA[member].pokemon) {
                for (const row of teamA[member].pokemon) {
                    row.readyBattleMode();
                    // await row.fetchByID();
                    await row.getTypesV2();
                    await row.readyBattleImage();
                }
            }
        }

        for (const member in teamB) {
            await teamB[member].fetchPokemon(msg.client.postgres);
            if (!teamB[member].pokemon.length) return await msg.followUp("Duel cancelled, <@" + member + "> does not have any Pokemon selected");
            teamB[member].readyBattleMode();
            if (teamB[member].pokemon) {
                for (const row of teamB[member].pokemon) {
                    row.readyBattleMode();
                    // await row.fetchByID();
                    await row.getTypesV2();
                    await row.readyBattleImage();
                }
            }
        }

        let battleEmbed = await returnEmbedBox(teamA, teamB);

        let battleMessage = await msg.followUp(battleEmbed);

        const battleCollector = new InteractionCollector(msg.client, {
            channel: msg.channel,
            interactionType: InteractionType.ApplicationCommand, // ApplicationCommand
            filter: x => {
                return x.commandName == "duel" && (teamA[x.user.id] || teamB[x.user.id]) && (x.options.getSubcommand() == "actions" || x.options.getSubcommand() == "moves" || x.options.getSubcommand() == "team");
            },
            time: 5 * 60000
        });

        let isPokemonBattle = false;
        let battleState = 1;
        let userCommands = [];

        function addUserCommand(user, commandName, commandObj = {}) {
            if (userCommands.find(x => x.user == user)) return false;
            return userCommands.push({ user, command: commandName, ...commandObj });
        }

        function checkComplete(teamA = {}, teamB = {}) {
            return (Object.values(teamA).filter(x => x.pokemon.find(x => x.battle.current_hp > 0)).length + Object.values(teamB).filter(x => x.pokemon.find(x => x.battle.current_hp > 0)).length <= userCommands.length);
        }

        function sortCommands(commands, teamA = {}, teamB = {}) {
            return commands.sort((x, y) => {
                let player_1 = teamA[x.user] || teamA[x.user]
                    , player_2 = teamB[y.user] || teamB[y.user]

                if (!player_1 || !player_2)
                    return;

                if (["inv", 'ball'].includes(x.command))
                    return -1;

                let x_pokemon = player_1.pokemon[player_1.battle.selected]
                    , y_pokemon = player_2.pokemon[player_2.battle.selected]
                    , x_speed = x_pokemon.calculateIV() * calculateModifier(x_pokemon.battle.mod, 'spd') || 0
                    , y_speed = y_pokemon.calculateIV() * calculateModifier(y_pokemon.battle.mod, 'spd') || 0;

                let x_move = x.command == "attack" && x.pr ? x.pr : 0
                let y_move = y.command == "attack" && y.pr ? y.pr : 0

                if (x_move > y_move)
                    return -1;
                if (y_move > x_move)
                    return 1;

                return y_speed - x_speed;
            })
        }

        function processCommands(commands = [], teamA = {}, teamB = {}) {

            let messages = [];

            for (let command of sortCommands(commands, teamA, teamB)) {
                switch (command.command) {
                    case "attack": {
                        const user = command.user;
                        const enemyTeam = teamA[user] ? teamB : teamA;

                        const player = teamA[user] || teamB[user];
                        const opponent_selected = Object.keys(enemyTeam)[command.toAttack];
                        const opponent = teamA[opponent_selected] || teamB[opponent_selected];

                        const player_pokemon = player.pokemon[player.battle.selected];
                        const opponent_pokemon = opponent.pokemon[opponent.battle.selected];

                        // Ignore if Pokemon already fainted
                        if (player_pokemon.battle.current_hp <= 0 || opponent_pokemon.battle.current_hp <= 0)
                            break;

                        // Handle Player Pokemon Status Effects

                        /*-- Start Player Status Effects --*/

                        // Cold
                        if (player_pokemon.battle.status.frz && randomint(100) <= 20) {
                            player_pokemon.battle.status.frz = void 0;
                            messages.push(`${player.globalName}'s ${capitalize(player_pokemon.pokemon)} broke out of the ice.`);
                        }

                        // Confusion
                        if (player_pokemon.battle.status.cnf && randomint(100) <= 33) {
                            player_pokemon.battle.status.cnf = void 0;
                            messages.push(`${player.globalName}'s ${capitalize(player_pokemon.pokemon)} snapped out of confusion.`);
                        }

                        /*-- End Player Status Effects --*/

                        // Select move or use Default "Tackle"
                        const move = command.move || {
                            "id": "tackle",
                            "name": "Tackle",
                            "t": "n",
                            "s": "p",
                            "d": 40,
                            "a": 100
                        };

                        let [atk, def] = move.s == "p" ? ["atk", 'def'] : ["spatk", 'spdef'];

                        const player_iv = player_pokemon.calculateIV(atk) * calculateModifier(player_pokemon.battle.mod, atk);
                        const opponent_iv = opponent_pokemon.calculateIV(def) * calculateModifier(opponent_pokemon.battle.mod, def);

                        const multi_strike = move.ms ? randomint(move.ms) + 1 : 1;

                        const [multiplier, notes] = damageMultiplier(opponent_pokemon.types, move, player_pokemon.types);

                        let last_notes = '';

                        const isStatusBlocked = player_pokemon.battle.status.frz || player_pokemon.battle.status.cnf || player_pokemon.battle.status.slp || player_pokemon.battle.status.par && randomint(100) < 75;

                        let didNotMiss = !move.a || move.a && randomint(100) <= parseInt(move.a.toString().replace(/∞/i, '100'));

                        var attack_damage = (!isStatusBlocked && didNotMiss) && move.d ? Math.ceil(((((2 * player_pokemon.level) / 5 + 2) * (move.d || 0) * (player_iv / opponent_iv)) / 50 + 2) * multiplier * ((randomint(38) + 217) / 255) * (player_pokemon.battle.status.brn && move.s == "p" ? 0.5 : 1) * (multi_strike)) : 0;

                        // Reduce HP of Opponent
                        opponent_pokemon.battle.current_hp -= attack_damage;

                        // If User's Pokemon is NOT StatusBlocked + Hit Chance approved
                        if (!isStatusBlocked && didNotMiss) {
                            /*-- Start Opponent Status Effects --*/
                            // Paralysis
                            // - If Move permits & Pokemon is NOT Electrical 
                            if (move.par && randomint(100) <= move.par && !opponent_pokemon.types.includes("e"))
                                // Reduce Speed by 50%
                                opponent_pokemon.stats.spd = opponent_pokemon.stats.spd * .5,
                                    // Mark as Paralyzed
                                    opponent_pokemon.battle.status.par = true,
                                    // Output result
                                    messages.push(`${opponent.globalName}'s ${capitalize(opponent_pokemon.pokemon)} was paralyzed`);

                            // Poison
                            // - If Move permits & Pokemon is NOT Poison OR Steel
                            if (move.psn && randomint(100) <= move.psn && (!opponent_pokemon.types.includes(['p']) && !opponent_pokemon.types.includes(['s'])))
                                // Mark as Poisoned
                                opponent_pokemon.battle.status.psn = true,
                                    // Output result
                                    messages.push(`${opponent.globalName}'s ${capitalize(opponent_pokemon.pokemon)} was poisoned`);

                            // Frozen
                            // - If Move permits & Pokemon is not Ice
                            if (move.frz && randomint(100) <= move.frz && !opponent_pokemon.types.includes("i"))
                                // Mark as Poisoned
                                opponent_pokemon.battle.status.frz = true,
                                    // Output result
                                    messages.push(`${opponent.globalName}'s ${capitalize(opponent_pokemon.pokemon)} was frozen`);

                            // Frozen Pokemon being Thawed
                            // - If Pokemon is Frozen + Fire Move is used
                            if (opponent_pokemon.battle.status.frz && ["flame-wheel", "sacred-fire", 'flare-blitz', 'fusion-flare', 'scald', 'steam-eruption', 'burn-up', 'pyro-ball'].includes(move.id)) {
                                // Mark as Unfrozen
                                opponent_pokemon.battle.status.frz = void 0;
                                // Output result
                                messages.push(`${opponent.globalName}'s ${capitalize(opponent_pokemon.pokemon)} is no longer frozen`);
                            }

                            // Sleep
                            // - If Move permits
                            if (move.slp && randomint(100) <= move.slp)
                                // Mark as Sleep
                                opponent_pokemon.battle.status.slp = true,
                                    // Output result
                                    messages.push(`${opponent.globalName}'s ${capitalize(opponent_pokemon.pokemon)} fell fast asleep`);

                            if (move.cnf && randomint(100) <= move.cnf)
                                // Mark as Sleep
                                opponent_pokemon.battle.status.cnf = true,
                                    // Output result
                                    messages.push(`${opponent.globalName}'s ${capitalize(opponent_pokemon.pokemon)} was confused`);

                            /*-- End Opponent Status Effects --*/

                            // Finish HP of Player if specified moves are used
                            if (["self-destruct", "explosion"].includes(move.id))
                                player_pokemon.battle.current_hp = 0,
                                    messages.push(`${player.globalName}'s ${capitalize(player_pokemon.pokemon)} exploded.`);

                            messages.push(didNotMiss ? `${player.globalName}'s ${capitalize(player_pokemon.pokemon)} used ${move.name} and did ${attack_damage * -1} damage on ${opponent.globalName}'s ${capitalize(opponent_pokemon.pokemon)}. ${multi_strike > 1 ? `It struck ${multi_strike} times.` : ''}` : `${player.globalName}'s ${capitalize(player_pokemon.pokemon)} used ${move.name} and missed.`);

                            if (opponent_pokemon.battle.current_hp <= 0)
                                opponent_pokemon.battle.current_hp = 0,
                                    messages.push(`${opponent.globalName}'s ${capitalize(opponent_pokemon.pokemon)} fainted.`);
                        }

                        // If Player's Pokemon was burnt or poisoned
                        if (player_pokemon.battle.status.brn || player_pokemon.battle.status.psn) {
                            let statusDamage = Math.round(player_pokemon.battle.current_hp * (1 / 16));
                            // Reduce HP
                            player_pokemon.battle.current_hp -= statusDamage;
                            // Output result
                            messages.push(`${player.globalName}'s ${capitalize(player_pokemon.pokemon)} was ${player_pokemon.battle.status.brn ? "Burnt" : "Poisoned"} and took ${statusDamage} damage.`);
                        }

                        if (last_notes)
                            messages.push(`${opponent.globalName}'s ${capitalize(opponent_pokemon.pokemon)} is now: ${notes}`);

                    }
                        break;
                    case "ball": {
                        const user = command.user;

                        const player = teamA[user] || teamB[user];

                        player.battle.selected = command.selected;

                        messages.push(`${player.globalName} brought out ${capitalize(player.pokemon[player.battle.selected].pokemon)}!`);
                    }
                        break;
                }
            }

            userCommands = [];

            return messages;
        }

        function checkIfPokemonFainted(teamA, teamB) {
            return [...Object.values(teamA), ...Object.values(teamB)].find(x => x.pokemon[x.battle.selected].battle.current_hp <= 0);
        }

        function checkOpposingPokemonFainted(teamA, teamB) {
            const A = [...Object.values(teamA)].find(x => x.pokemon.find(x => x.battle.current_hp > 0));
            const B = [...Object.values(teamB)].find(x => x.pokemon.find(x => x.battle.current_hp > 0));

            if (!A && B)
                return { winner: B, losers: A, winnerCode: "B" };

            if (!B && A)
                return { winner: A, losers: B, winnerCode: "A" };

            return false;
        }

        function keepOrRemoveGiga(selectedPokemon, msg) {
            // Reduce Count
            if (selectedPokemon.battle.giga) selectedPokemon.battle.giga--;
            // Check if Count = 0
            if (selectedPokemon.battle.giga === 0) {
                // Reverting to Normal
                selectedPokemon.battle.giga = false;
                selectedPokemon.battle.current_hp = Math.round(selectedPokemon.battle.current_hp - selectedPokemon.battle.current_hp * .5);
                selectedPokemon.battle.max_hp = Math.round(selectedPokemon.battle.max_hp - selectedPokemon.battle.max_hp * .5);
                // Change Image
                imageChanged = 1;
                // Respond back to user
                msg.channel.send(`${capitalize(selectedPokemon.pokemon)} has reverted back...`);
            }

            return false;
        }

        let sequenceState = 1;

        let imageChanged = 0;

        battleCollector.on('collect', async m => {
            // ID of user
            let id = BigInt(m.user.id);

            // Find Player
            const player = teamA[id] || teamB[id];

            // Find Selected Pokemon
            const selectedPokemon = player.pokemon[player.battle.selected];

            // Find SubCommand
            switch (m.options.getSubcommand()) {
                case "moves":
                    // Return Pokemon Moves with Details
                    return await m.reply({
                        ephemeral: true,
                        embeds: [{
                            title: `Moveset of ${capitalize()}`,
                            fields: selectedPokemon.returnMoves().map((x, i) => {
                                return {
                                    name: (i + 1) + ") " + x.name,
                                    value: `**Type**: ${capitalize(x.type)}\n**Damage**: ${x.d}`,
                                    inline: true
                                };
                            }
                            )
                        }]
                    });

                // Return Team Stats
                case "team":
                    return await m.reply({
                        ephemeral: true,
                        embeds: [{
                            title: player.globalName + "'s team",
                            fields: player.pokemon.map((x, i) => {
                                return {
                                    name: (i + 1) + ") " + capitalize(x.pokemon) + ` [ Level ${x.level} ]`,
                                    value: `**HP**: ${x.battle.current_hp}/${x.battle.max_hp}`, // ${Object.keys(x.battle.status).length() != 0 ? "\n**Status**: " + Object.values(x.status).filter(x => a_a[x]).map(x => a_a[x]).join(", ") || "None" : ""}
                                    inline: true
                                }
                            }
                            ),
                            color: Color("yellow").rgbNumber()
                        }]
                    });
            }

            // Giga-DynaMax
            if (m.options.getBoolean("dyna-giga")) {
                if (selectedPokemon.battle.giga)
                    return await m.reply({ content: "This Pokemon is already a Giga/Dynamax" });

                if (player.battle.giga)
                    return await m.reply({ content: "A Pokemon has already Giga/Dynamaxed" });

                // Set to True
                selectedPokemon.battle.giga = 3;

                // Alter Health
                selectedPokemon.battle.current_hp += Math.round(selectedPokemon.battle.current_hp * .5);
                selectedPokemon.battle.max_hp += Math.round(selectedPokemon.battle.max_hp + .5);

                // Allow Image Alteration
                imageChanged = 1;

                // Respond to User
                m.reply(`${player.globalName}, your ${capitalize(selectedPokemon.pokemon)} giga-chad'd`);
            }

            // Running Away
            if (isPokemonBattle && m.options.getBoolean("run-away"))
                return battleState = 0, battleCollector.stop(), m.reply({ content: "✅", ephemeral: true });

            // Attack Sequence
            if (m.options.getInteger("attack"))
                if (sequenceState && selectedPokemon.battle.current_hp > 0) {
                    // Add Command with details
                    if (!addUserCommand(id, "attack", { toAttack: (m.options.getInteger("attack-user") || 1) - 1, move: selectedPokemon.returnMoves()[m.options.getInteger("attack") - 1] }))
                        m.reply({ content: "You already responded", ephemeral: true })
                    else
                        keepOrRemoveGiga(selectedPokemon, m),
                            m[m.replied ? "followUp" : "reply"]({ ephemeral: true, content: "✅" })
                } else if (!sequenceState)
                    m.reply({ content: "Please wait till all fainted Pokemon have been called", ephemeral: true });

            if (m.options.getInteger("switch")) {

                const switchPokemon = m.options.getInteger("switch") - 1;

                if (!player.pokemon[switchPokemon])
                    return await m.reply("Yeah that Pokemon does not exist");
                if (player.pokemon[switchPokemon].battle.current_hp <= 0)
                    return await m.reply("That Pokemon cannot move right now");
                if (player.battle.selected == switchPokemon)
                    return await m.reply("Your Pokemon is currently on the field. It recollects the time you forgot it in the supermarket.");


                if (!sequenceState) {
                    if (player.pokemon[player.battle.selected].battle.current_hp > 0)
                        return await m.reply({ ephemeral: true, content: "You cannot switch Pokemon while another person's preparing a funeral" });
                    player.battle.selected = switchPokemon;
                    m.reply(`${player.globalName}: ${capitalize(player.pokemon[player.battle.selected].pokemon)}! ${Chance().pickone(["I choose you!", "Hang in there!", "Just a little bit more!", "Please don't die on me too!", "I'll buy you KFC if we win this!"])}`);
                    if (!checkIfPokemonFainted(teamA, teamB)) {
                        sequenceState = 1;
                        imageChanged = 1;
                        m.channel.send("Begin attacking again!");
                    }
                } else {

                    // Return to Normal
                    if (selectedPokemon.battle.giga) selectedPokemon.battle.giga = false;

                    if (!addUserCommand(id, "ball", { selected: switchPokemon }))
                        m.reply({ content: "You already responded", ephemeral: true })
                    else
                        keepOrRemoveGiga(selectedPokemon, m),
                            imageChanged = 1,
                            m[m.replied ? "followUp" : "reply"]({ ephemeral: true, content: "✅" })
                }
            }

            // Check if Completed
            if (checkComplete(teamA, teamB)) {
                const extraNotes = processCommands(userCommands, teamA, teamB);
                battleMessage = await m.channel.send(returnNewFieldEmbed(imageChanged ? await returnEmbedBox(teamA, teamB) : { embeds: [battleMessage.embeds[0].data] }, extraNotes, teamA, teamB));
                if (imageChanged) imageChanged = 0;

                if (checkIfPokemonFainted(teamA, teamB))
                    sequenceState = 0;

                const opposingTeam = checkOpposingPokemonFainted(teamA, teamB);
                if (opposingTeam) {
                    battleState = 2;
                    battleCollector.stop();
                }
            }
        });

        battleCollector.on("end", m => {

            console.log(`Collected ${m.size} items`);

            // Remove duel State
            for (const member in teamA) {
                teamA[member].removeDuelsState(msg.client.redis);
            }

            for (const member in teamB) {
                teamB[member].removeDuelsState(msg.client.redis);
            }

            if (!battleState) return msg.channel.send("User ran away!");

            if (battleState == 2) return msg.channel.send(`Team ${checkOpposingPokemonFainted(teamA, teamB).winnerCode} won the battle!`);

            return msg.channel.send("Battle ended!");

        });

        return true;

    }
}
