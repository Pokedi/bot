import { ComponentType, InteractionCollector, InteractionType, MessageFlags, SlashCommandBuilder } from "discord.js";
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
import { ENUM_POKEMON_BASE_STATS_IDS, ENUM_POKEMON_BASE_STATS_SHORTIDS, ENUM_POKEMON_TYPES, ENUM_STAT_MOD_COMMENTS, reverseENUM } from "../../Utilities/Data/enums.js";

function checkIfCanProcessItem(itemID, pokemonBattle = { current_hp: 0, max_hp: 0, status: {} }) {
    switch (itemID) {
        case 17:
        case 24:
        case 25:
        case 26:
        case 28:
        case 29:
        case 23:
        case 132:
            return !(pokemonBattle.current_hp == pokemonBattle.max_hp);
        case 126:
            return !!pokemonBattle.status.par;
        case 127:
            return !!pokemonBattle.status.slp;
        case 128:
            return !!pokemonBattle.status.psn;
        case 129:
            return !!pokemonBattle.status.brn;
        case 130:
            return !!pokemonBattle.status.frz;
        case 133:
            return !!pokemonBattle.status.cnf;
        case 134:
            return Object.keys(pokemonBattle.status).length;
    }
}

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('duel')
        .setNameLocalizations({
            'pt-BR': 'duelo',
            'es-ES': 'duelo',
            'de': 'duell',
            'fr': 'duel'
        })
        .setDescription('Admin command')
        .setDescriptionLocalizations({
            'pt-BR': 'Comando de administrador',
            'es-ES': 'Comando de administrador',
            'de': 'Admin-Befehl',
            'fr': 'Commande admin'
        })
        .addSubcommand(x => x
            .setName("start")
            .setNameLocalizations({
                'pt-BR': 'iniciar',
                'es-ES': 'iniciar',
                'de': 'start',
                'fr': 'démarrer'
            })
            .setDescription("Setup a Duel")
            .setDescriptionLocalizations({
                'pt-BR': 'Configurar um duelo',
                'es-ES': 'Configurar un duelo',
                'de': 'Duel einrichten',
                'fr': 'Configurer un duel'
            })
            .addMentionableOption(x => x
                .setName("vs-user-1")
                .setNameLocalizations({
                    'pt-BR': 'vs-usuario-1',
                    'es-ES': 'vs-usuario-1',
                    'de': 'vs-benutzer-1',
                    'fr': 'vs-utilisateur-1'
                })
                .setDescription("First opponent [Required]")
                .setDescriptionLocalizations({
                    'pt-BR': 'Primeiro oponente [Obrigatório]',
                    'es-ES': 'Primer oponente [Requerido]',
                    'de': 'Erster Gegner [Erforderlich]',
                    'fr': 'Premier adversaire [Requis]'
                })
            )
            .addMentionableOption(x => x
                .setName("vs-user-2")
                .setNameLocalizations({
                    'pt-BR': 'vs-usuario-2',
                    'es-ES': 'vs-usuario-2',
                    'de': 'vs-benutzer-2',
                    'fr': 'vs-utilisateur-2'
                })
                .setDescription("Second opponent")
                .setDescriptionLocalizations({
                    'pt-BR': 'Segundo oponente',
                    'es-ES': 'Segundo oponente',
                    'de': 'Zweiter Gegner',
                    'fr': 'Deuxième adversaire'
                })
            )
            .addMentionableOption(x => x
                .setName("vs-user-3")
                .setNameLocalizations({
                    'pt-BR': 'vs-usuario-3',
                    'es-ES': 'vs-usuario-3',
                    'de': 'vs-benutzer-3',
                    'fr': 'vs-utilisateur-3'
                })
                .setDescription("Third opponent")
                .setDescriptionLocalizations({
                    'pt-BR': 'Terceiro oponente',
                    'es-ES': 'Tercer oponente',
                    'de': 'Dritter Gegner',
                    'fr': 'Troisième adversaire'
                })
            )
            .addMentionableOption(x => x
                .setName("2-user-vs")
                .setNameLocalizations({
                    'pt-BR': '2-usuario-vs',
                    'es-ES': '2-usuario-vs',
                    'de': '2-benutzer-vs',
                    'fr': '2-utilisateur-vs'
                })
                .setDescription("Second teammate")
                .setDescriptionLocalizations({
                    'pt-BR': 'Segundo colega de equipe',
                    'es-ES': 'Segundo compañero',
                    'de': 'Zweiter Mitspieler',
                    'fr': 'Deuxième coéquipier'
                })
            )
            .addMentionableOption(x => x
                .setName("3-user-vs")
                .setNameLocalizations({
                    'pt-BR': '3-usuario-vs',
                    'es-ES': '3-usuario-vs',
                    'de': '3-benutzer-vs',
                    'fr': '3-utilisateur-vs'
                })
                .setDescription("Third teammate")
                .setDescriptionLocalizations({
                    'pt-BR': 'Terceiro colega de equipe',
                    'es-ES': 'Tercer compañero',
                    'de': 'Dritter Mitspieler',
                    'fr': 'Troisième coéquipier'
                })
            )
        )
        .addSubcommand(x => x
            .setName("actions")
            .setNameLocalizations({
                'pt-BR': 'acoes',
                'es-ES': 'acciones',
                'de': 'aktionen',
                'fr': 'actions'
            })
            .setDescription("Attack, defend, switch, or flee")
            .setDescriptionLocalizations({
                'pt-BR': 'Atacar, defender, trocar ou fugir',
                'es-ES': 'Atacar, defender, cambiar o huir',
                'de': 'Angreifen, verteidigen, wechseln oder fliehen',
                'fr': 'Attaquer, défendre, changer ou fuir'
            })
            .addIntegerOption(y => y
                .setName("attack")
                .setNameLocalizations({
                    'pt-BR': 'ataque',
                    'es-ES': 'ataque',
                    'de': 'angriff',
                    'fr': 'attaque'
                })
                .setDescription("Pick an attack (see /duel moves)")
                .setDescriptionLocalizations({
                    'pt-BR': 'Escolha um ataque (/duel moves)',
                    'es-ES': 'Elige un ataque (/duel moves)',
                    'de': 'Wähle einen Angriff (/duel moves)',
                    'fr': 'Choisissez une attaque (/duel moves)'
                })
                .setMaxValue(4)
                .setMinValue(1)
                .setChoices(
                    { name: "First Attack", value: 1 },
                    { name: "Second Attack", value: 2 },
                    { name: "Third Attack", value: 3 },
                    { name: "Forth Attack", value: 4 }
                )
            )
            .addIntegerOption(y => y
                .setName("attack-user")
                .setNameLocalizations({
                    'pt-BR': 'atacar-usuario',
                    'es-ES': 'atacar-usuario',
                    'de': 'angriff-benutzer',
                    'fr': 'attaquer-utilisateur'
                })
                .setDescription("Target user [Default 1]")
                .setDescriptionLocalizations({
                    'pt-BR': 'Usuário alvo [Padrão 1]',
                    'es-ES': 'Usuario objetivo [Predeterminado 1]',
                    'de': 'Zielbenutzer [Standard 1]',
                    'fr': 'Utilisateur ciblé [Par défaut 1]'
                })
                .setMaxValue(3)
                .setMinValue(1)
            )
            .addIntegerOption(y => y
                .setName("switch")
                .setNameLocalizations({
                    'pt-BR': 'trocar',
                    'es-ES': 'cambiar',
                    'de': 'wechseln',
                    'fr': 'changer'
                })
                .setDescription("Switch your Pokémon")
                .setDescriptionLocalizations({
                    'pt-BR': 'Troque seu Pokémon',
                    'es-ES': 'Cambia tu Pokémon',
                    'de': 'Wechsle dein Pokémon',
                    'fr': 'Changez de Pokémon'
                })
                .setMaxValue(6)
                .setMinValue(1)
                .setChoices(
                    { name: "First Pokemon", value: 1 },
                    { name: "Second Pokemon", value: 2 },
                    { name: "Third Pokemon", value: 3 },
                    { name: "Forth Pokemon", value: 4 },
                    { name: "Fifth Pokemon", value: 5 },
                    { name: "Sixth Pokemon", value: 6 }
                )
            )
            .addIntegerOption(y => y
                .setName('berry')
                .setNameLocalizations({
                    'pt-BR': 'fruta',
                    'es-ES': 'baya',
                    'de': 'beere',
                    'fr': 'baie'
                })
                .setDescription("Use a Berry")
                .setDescriptionLocalizations({
                    'pt-BR': 'Use uma Fruta',
                    'es-ES': 'Usa una Baya',
                    'de': 'Benutze eine Beere',
                    'fr': 'Utilisez une Baie'
                })
                .addChoices(
                    { name: "Cheri Berry", value: 126 },
                    { name: "Chesto Berry", value: 127 },
                    { name: "Pecha Berry", value: 128 },
                    { name: "Rawst Berry", value: 129 },
                    { name: "Aspear Berry", value: 130 },
                    { name: "Oran Berry", value: 132 },
                    { name: "Persim Berry", value: 133 },
                    { name: "Lum Berry", value: 134 }
                )
            )
            .addIntegerOption(y => y
                .setName('potion')
                .setNameLocalizations({
                    'pt-BR': 'pocao',
                    'es-ES': 'pocion',
                    'de': 'trank',
                    'fr': 'potion'
                })
                .setDescription("Use a Potion")
                .setDescriptionLocalizations({
                    'pt-BR': 'Use uma Poção',
                    'es-ES': 'Usa una Poción',
                    'de': 'Benutze einen Trank',
                    'fr': 'Utilisez une Potion'
                })
                .addChoices(
                    { name: "Potion", value: 17 },
                    { name: "Max Potion", value: 24 },
                    { name: "Hyper Potion", value: 25 },
                    { name: "Super Potion", value: 26 },
                    { name: "Full Restore", value: 23 },
                    { name: "Revive", value: 28 },
                    { name: "Max Revive", value: 29 }
                )
            )
            .addIntegerOption(y => y
                .setName("item-target")
                .setNameLocalizations({
                    'pt-BR': 'alvo-item',
                    'es-ES': 'objetivo-item',
                    'de': 'ziel-item',
                    'fr': 'cible-objet'
                })
                .setDescription("Choose which Pokémon gets the item")
                .setDescriptionLocalizations({
                    'pt-BR': 'Escolha qual Pokémon receberá o item',
                    'es-ES': 'Elige qué Pokémon recibe el objeto',
                    'de': 'Wähle Pokémon für das Item',
                    'fr': 'Choisissez le Pokémon pour l\'objet'
                })
                .setMinValue(1)
                .setMaxValue(6)
            )
            .addBooleanOption(y => y
                .setName("dyna-giga")
                .setNameLocalizations({
                    'pt-BR': 'dyna-giga',
                    'es-ES': 'dyna-giga',
                    'de': 'dyna-giga',
                    'fr': 'dyna-giga'
                })
                .setDescription("Giga/Dyna Max Pokémon")
                .setDescriptionLocalizations({
                    'pt-BR': 'Giga/Dyna Max Pokémon',
                    'es-ES': 'Giga/Dyna Max Pokémon',
                    'de': 'Giga/Dyna Max Pokémon',
                    'fr': 'Giga/Dyna Max Pokémon'
                })
            )
        )
        .addSubcommand(x => x
            .setName("moves")
            .setNameLocalizations({
                'pt-BR': 'movimentos',
                'es-ES': 'movimientos',
                'de': 'attacken',
                'fr': 'attaques'
            })
            .setDescription("Check Pokémon's moves")
            .setDescriptionLocalizations({
                'pt-BR': 'Ver movimentos do Pokémon',
                'es-ES': 'Ver movimientos del Pokémon',
                'de': 'Zeige Pokémon-Attacken',
                'fr': 'Voir attaques du Pokémon'
            })
        )
        .addSubcommand(x => x
            .setName("team")
            .setNameLocalizations({
                'pt-BR': 'equipe',
                'es-ES': 'equipo',
                'de': 'team',
                'fr': 'équipe'
            })
            .setDescription("Check your Pokémon")
            .setDescriptionLocalizations({
                'pt-BR': 'Veja seus Pokémon',
                'es-ES': 'Ver tus Pokémon',
                'de': 'Zeige deine Pokémon',
                'fr': 'Voir vos Pokémon'
            })
        )
        .addSubcommand(x => x
            .setName("help")
            .setNameLocalizations({
                'pt-BR': 'ajuda',
                'es-ES': 'ayuda',
                'de': 'hilfe',
                'fr': 'aide'
            })
            .setDescription("How to use Duel and fight your rival")
            .setDescriptionLocalizations({
                'pt-BR': 'Como usar Duelo e enfrentar rival',
                'es-ES': 'Cómo usar Duelo y luchar con rival',
                'de': 'Duel verwenden und Rivalen bekämpfen',
                'fr': 'Utiliser Duel et affronter rival'
            })
        ),
    async execute(msg) {

        // if (msg.user.id != "688446585524584502") return await msg.reply("Yeah, this is currently being remade");

        if (msg.options.getSubcommand() == "help")
            return msg.options._hoistedOptions.push({ name: "command_name", type: 3, value: "duel" }),
                msg.client.commands.get("help")(msg);

        if (msg.options.getSubcommand() != "start")
            return true;

        if (msg.options.getBoolean("run-away"))
            return await msg[msg.replied ? "followUp" : "reply"]({ flags: MessageFlags.Ephemeral, content: "Please wait 5-10 minutes till you can use this." });

        const teamAIDs = removeDuplicates([msg.user.id, msg.options.getUser('2-user-vs'), msg.options.getUser('3-user-vs')]).filter(x => x && !x.bot);
        const teamBIDs = removeDuplicates([msg.options.getUser('vs-user-1'), msg.options.getUser('vs-user-2'), msg.options.getUser('vs-user-3')]).filter(x => x && !x.bot);

        if (!teamAIDs.length || !teamBIDs.length)
            return await msg.reply("You need to mention a specified number of players");

        if (teamAIDs.find(x => teamBIDs.includes(x)) || teamBIDs.find(x => teamAIDs.includes(x)))
            return await msg.reply("You cannot have the same members on both sides.");

        const verification = await buttonVerification({ interaction: msg, users: [msg.user].concat(teamAIDs, teamBIDs).filter(x => x && x.id).map(x => x.id) });

        if (!verification) return await msg.followUp("Users did not verify in time.");

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

        if (teamAConstructs.find(x => !x.selected?.length) || teamBConstructs.find(x => !x.selected?.length))
            return await msg.followUp("One of the players does not have a Pokemon selected.");

        // Ready Teams
        const teamA = Object.assign(...teamAConstructs.map(x => ({ [x.id]: x })));
        const teamB = Object.assign(...teamBConstructs.map(x => ({ [x.id]: x })));

        for (const member in teamA) {
            await teamA[member].fetchPokemon(msg.client.postgres);
            if (!teamA[member].pokemon.length) return await msg.followUp("Duel cancelled, <@" + member + "> does not have any Pokemon selected");
            teamA[member].readyBattleMode();
            teamA[member].fetchInventory(msg.client.postgres, true);
            if (teamA[member].pokemon) {
                for (const row of teamA[member].pokemon) {
                    await row.fetchByID();
                    await row.fetchMoves();
                    row.readyBattleMode();
                    // await row.getTypesV2();
                    await row.readyBattleImage();
                }
            }
        }

        for (const member in teamB) {
            await teamB[member].fetchPokemon(msg.client.postgres);
            if (!teamB[member].pokemon.length) return await msg.followUp("Duel cancelled, <@" + member + "> does not have any Pokemon selected");
            teamB[member].readyBattleMode();
            teamB[member].fetchInventory(msg.client.postgres, true);
            if (teamB[member].pokemon) {
                for (const row of teamB[member].pokemon) {
                    await row.fetchByID();
                    await row.fetchMoves();
                    row.readyBattleMode();
                    // await row.getTypesV2();
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
            time: 10 * 60000
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
                try {
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
                            const move = {
                                ...(command.move || {
                                    "id": "",
                                    "name": "Tackle",
                                    "type": "normal",
                                    "damage_type": "physical",
                                    "power": 40,
                                    "accuracy": 100
                                })
                            };

                            move.type = reverseENUM(ENUM_POKEMON_TYPES, move.type);

                            let [atk, def] = move.damage_type == "physical" ? ["atk", 'def'] : ["spatk", 'spdef'];

                            const player_iv = player_pokemon.calculateIV(atk) * calculateModifier(player_pokemon.battle.mod, atk);
                            const opponent_iv = opponent_pokemon.calculateIV(def) * calculateModifier(opponent_pokemon.battle.mod, def);

                            const move_ms = move.meta && move.meta.max_hits ? move.meta.max_hits : 0;

                            // Ailment Handler
                            if (move.meta && move.meta.ailment && move.meta.ailment != 'none') {
                                switch (move.meta.ailment) {
                                    case "burn":
                                        move.brn = move.ailment_chance || move.accuracy;
                                        break;
                                    case "paralysis":
                                        move.par = move.ailment_chance || move.accuracy;
                                        break;
                                    case "sleep":
                                        move.slp = move.ailment_chance || move.accuracy;
                                        break;
                                    case "poison":
                                        move.psn = move.ailment_chance || move.accuracy;
                                        break;
                                    case "freeze":
                                        move.frz = move.ailment_chance || move.accuracy;
                                        break;
                                    case "confusion":
                                        move.cnf = move.ailment_chance || move.accuracy;
                                        break;
                                }
                            }

                            const multi_strike = move_ms ? randomint(move_ms) + 1 : 1;

                            const [multiplier, notes] = damageMultiplier(opponent_pokemon.types, move, player_pokemon.types);

                            let last_notes = '';

                            // is Pokemon allowed to attack?
                            const isStatusBlocked = player_pokemon.battle.status.frz || player_pokemon.battle.status.cnf || player_pokemon.battle.status.slp || player_pokemon.battle.status.par && randomint(100) < 75;

                            // Determine chances of being missed
                            let didNotMiss = !move.accuracy || move.accuracy && randomint(100) <= move.accuracy;

                            // Calculate Damage
                            let attack_damage = (!isStatusBlocked && didNotMiss) && move.power ? Math.ceil(((((2 * player_pokemon.level) / 5 + 2) * (move.power || 0) * (player_iv / opponent_iv)) / 50 + 2) * multiplier * ((randomint(38) + 217) / 255) * (player_pokemon.battle.status.brn && move.damage_type == "physical" ? 0.5 : 1) * (multi_strike)) : 0;

                            // Reduce HP of Opponent
                            opponent_pokemon.battle.current_hp -= attack_damage;

                            // Finish HP of Player if specified moves are used
                            if (["self-destruct", "explosion"].includes(move.id))
                                player_pokemon.battle.current_hp = 0,
                                    messages.push(`${player.globalName}'s ${capitalize(player_pokemon.pokemon)} exploded.`);

                            messages.push(didNotMiss ? `${player.globalName}'s ${capitalize(player_pokemon.pokemon)} used ${move.name} and did ${attack_damage * -1} damage on ${opponent.globalName}'s ${capitalize(opponent_pokemon.pokemon)}. ${multi_strike > 1 ? `It struck ${multi_strike} times.` : ''}` : `${player.globalName}'s ${capitalize(player_pokemon.pokemon)} used ${move.name} and missed.`);

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

                            // Player's Pokemon Stat Modifiers
                            if (move.changes.length)
                                // Loop Over each (De)Buff
                                for (const change of move.changes) {
                                    // Check if Stat ID Valid
                                    if (change.stat_id) {
                                        const shortStatID = ENUM_POKEMON_BASE_STATS_SHORTIDS[change.stat_id];
                                        switch (change.target_id) {
                                            case 2:
                                            case 3:
                                            case 4:
                                            case 5:
                                            case 7:
                                            case 13:
                                            case 15: {
                                                player_pokemon.battle.mods[shortStatID] = (player_pokemon.battle.mods[shortStatID] || 0) + change.change;
                                                const tooExtreme = player_pokemon.battle.mods[shortStatID] > 6 || player_pokemon.battle.mods[shortStatID] < -6
                                                if (tooExtreme) {
                                                    player_pokemon.battle.mods[shortStatID] = player_pokemon.battle.mods[shortStatID] > 6 ? 6 : -6;
                                                    messages.push(`${player.globalName}'s ${capitalize(player_pokemon.pokemon)} ${capitalize(change.stat, true)} cannot go any ${change.change < 0 ? "lower" : "higher"}`);
                                                } else {
                                                    messages.push(`${player.globalName}'s ${capitalize(player_pokemon.pokemon)} ${capitalize(change.stat, true)} ${ENUM_STAT_MOD_COMMENTS[change.change]}`)
                                                }
                                            }
                                                break;
                                            case 6:
                                            case 8:
                                            case 9:
                                            case 10:
                                            case 11:
                                            case 12:
                                            case 14: {
                                                opponent_pokemon.battle.mods[shortStatID] = (opponent_pokemon.battle.mods[shortStatID] || 0) + change.change;
                                                const tooExtreme = opponent_pokemon.battle.mods[shortStatID] > 6 || opponent_pokemon.battle.mods[shortStatID] < -6
                                                if (tooExtreme) {
                                                    opponent_pokemon.battle.mods[shortStatID] = opponent_pokemon.battle.mods[shortStatID] > 6 ? 6 : -6;
                                                    messages.push(`${opponent.globalName}'s ${capitalize(player_pokemon.pokemon)} ${capitalize(change.stat, true)} cannot go any ${change.change < 0 ? "lower" : "higher"}`);
                                                } else {
                                                    messages.push(`${opponent.globalName}'s ${capitalize(opponent_pokemon.pokemon)} ${capitalize(change.stat, true)} ${ENUM_STAT_MOD_COMMENTS[change.change]}`)
                                                }
                                            }
                                                break;
                                        }
                                    }
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
                        case "inv": {
                            const user = command.user;

                            const player = teamA[user] || teamB[user];

                            const selectedPokemon = player.pokemon[command.target];

                            const itemID = command.item_id;

                            switch (itemID) {
                                case 132:
                                    selectedPokemon.battle.current_hp += 10;
                                    messages.push(`${player.globalName} gave ${capitalize(selectedPokemon.pokemon)} a ${command.item.name} and healed 10 HP`);
                                    break;
                                case 17:
                                    selectedPokemon.battle.current_hp += 20;
                                    messages.push(`${player.globalName} gave ${capitalize(selectedPokemon.pokemon)} a ${command.item.name} and healed 20 HP`);
                                    break;
                                case 24:
                                    selectedPokemon.battle.current_hp = selectedPokemon.battle.max_hp;
                                    messages.push(`${player.globalName} gave ${capitalize(selectedPokemon.pokemon)} a ${command.item.name} and fully restored its HP`);
                                    break;
                                case 25:
                                    selectedPokemon.battle.current_hp += 200;
                                    messages.push(`${player.globalName} gave ${capitalize(selectedPokemon.pokemon)} a ${command.item.name} and healed 200 HP`);
                                    break;
                                case 26:
                                    selectedPokemon.battle.current_hp += 50;
                                    messages.push(`${player.globalName} gave ${capitalize(selectedPokemon.pokemon)} a ${command.item.name} and healed 50 HP`);
                                    break;
                                case 23:
                                    selectedPokemon.battle.current_hp = selectedPokemon.battle.max_hp;
                                    selectedPokemon.battle.status = {};
                                    messages.push(`${player.globalName} gave ${capitalize(selectedPokemon.pokemon)} a ${command.item.name} and fully restored itself`);
                                    break;
                                case 126:
                                    delete selectedPokemon.status.par;
                                    messages.push(`${player.globalName} gave ${capitalize(selectedPokemon.pokemon)} a ${command.item.name} and cured its paralysis`);
                                    break
                                case 127:
                                    delete selectedPokemon.status.slp;
                                    messages.push(`${player.globalName} gave ${capitalize(selectedPokemon.pokemon)} a ${command.item.name} and woke up`);
                                    break;
                                case 128:
                                    delete selectedPokemon.status.psn;
                                    messages.push(`${player.globalName} gave ${capitalize(selectedPokemon.pokemon)} a ${command.item.name} and cured its poison`);
                                    break;
                                case 129:
                                    delete selectedPokemon.status.brn;
                                    messages.push(`${player.globalName} gave ${capitalize(selectedPokemon.pokemon)} a ${command.item.name} and healed his burns`);
                                    break;
                                case 130:
                                    delete selectedPokemon.status.frz;
                                    messages.push(`${player.globalName} gave ${capitalize(selectedPokemon.pokemon)} a ${command.item.name} and thawed`);
                                    break;
                                case 133:
                                    delete selectedPokemon.status.cnf;
                                    messages.push(`${player.globalName} gave ${capitalize(selectedPokemon.pokemon)} a ${command.item.name} and snapped out of confusion`);
                                    break;
                                case 134:
                                    selectedPokemon.status = {};
                                    messages.push(`${player.globalName} gave ${capitalize(selectedPokemon.pokemon)} a ${command.item.name} and removed all ailments`);
                                    break;
                            }

                            if (selectedPokemon.battle.current_hp > selectedPokemon.battle.max_hp)
                                selectedPokemon.battle.current_hp = selectedPokemon.battle.max_hp;
                        }
                    }
                } catch (error) {
                    console.log(error);
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
                        flags: MessageFlags.Ephemeral,
                        embeds: [{
                            title: `Moveset of ${capitalize()}`,
                            fields: selectedPokemon.processedMoves.map((x, i) => {
                                return {
                                    name: (i + 1) + ") " + x.name,
                                    value: `**Type**: ${capitalize(x.type)}\n**Damage**: ${x.power}`,
                                    inline: true
                                };
                            }
                            )
                        }]
                    });

                // Return Team Stats
                case "team":
                    return await m.reply({
                        flags: MessageFlags.Ephemeral,
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

                // Giga one Pokemon per Player
                player.battle.giga = true;

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
                return battleState = 0, battleCollector.stop(), m.reply({ content: "✅", flags: MessageFlags.Ephemeral });

            // Attack Sequence
            if (m.options.getInteger("attack"))
                if (sequenceState && selectedPokemon.battle.current_hp > 0) {
                    // Add Command with details
                    if (!addUserCommand(id, "attack", { toAttack: (m.options.getInteger("attack-user") || 1) - 1, move: selectedPokemon.processedMoves[m.options.getInteger("attack") - 1] }))
                        m.reply({ content: "You already responded", flags: MessageFlags.Ephemeral })
                    else
                        keepOrRemoveGiga(selectedPokemon, m),
                            m[m.replied ? "followUp" : "reply"]({ flags: MessageFlags.Ephemeral, content: "✅" })
                } else if (!sequenceState)
                    m.reply({ content: "Please wait till all fainted Pokemon have been called", flags: MessageFlags.Ephemeral });

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
                        return await m.reply({ flags: MessageFlags.Ephemeral, content: "You cannot switch Pokemon while another person's preparing a funeral" });
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
                        m.reply({ content: "You already responded", flags: MessageFlags.Ephemeral })
                    else
                        keepOrRemoveGiga(selectedPokemon, m),
                            imageChanged = 1,
                            m[m.replied ? "followUp" : "reply"]({ flags: MessageFlags.Ephemeral, content: "✅" })
                }
            }

            // Potions & Berries
            if (m.options.getInteger("potion") || m.options.getInteger("berry")) {

                // Retrive permissible IDs
                const itemID = m.options.getInteger("potion") || m.options.getInteger("berry");

                const doesPlayerHaveItem = player.inventory.find(x => x.item_id == itemID);

                if (!doesPlayerHaveItem?.amount)
                    return m[m.replied ? "followUp" : "reply"]({ flags: MessageFlags.Ephemeral, content: "You do not have that item..." });

                const isAllowed = checkIfCanProcessItem(itemID, player.pokemon[m.options.getInteger("item-target") || player.battle.selected]?.battle);

                if (!isAllowed)
                    return m.reply({ content: "That item won't have any effect", flags: MessageFlags.Ephemeral });

                if (!addUserCommand(id, "inv", { item_id: itemID, item: doesPlayerHaveItem, target: m.options.getInteger("item-target") || player.battle.selected }))
                    m.reply({ content: "You already responded", flags: MessageFlags.Ephemeral })
                else
                    doesPlayerHaveItem.amount--,
                        await msg.client.postgres`UPDATE user_inventory SET amount = amount - 1 WHERE user_id = ${player.id} AND item_id = ${itemID}`,
                        await m[m.replied ? "followUp" : "reply"]({ flags: MessageFlags.Ephemeral, content: "✅" });
            }

            // Check if Completed
            if (checkComplete(teamA, teamB)) {
                const extraNotes = processCommands(userCommands, teamA, teamB);
                battleMessage = await m.channel.send(returnNewFieldEmbed(imageChanged ? await returnEmbedBox(teamA, teamB) : { embeds: [battleMessage.resource.message.embeds[0].data] }, extraNotes, teamA, teamB));
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
