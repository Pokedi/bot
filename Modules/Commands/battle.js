import { SlashCommandBuilder } from "discord.js";
import Player from "../../Classes/player.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('battle')
        .setDescription('Let er Rip! Oh wait, wrong one, AUTOBOTS! ROLLOUT!')
        .addSubcommand(x =>
            x.setName('start')
                .setDescription('Use this command to start your battle')
                .addUserOption(x =>
                    x.setName('opponent-1')
                        .setDescription("Mention your Opponent if you Dare!")
                )
                .addUserOption(x =>
                    x.setName('opponent-2')
                        .setDescription("Only available if GameMode is Multiplayer")
                )
                .addUserOption(x =>
                    x.setName('ally')
                        .setDescription("Only available if GameMode is Multiplayer")
                )
                .addBooleanOption(x =>
                    x.setName('multiplayer')
                        .setDescription("Multiplayer 2v2")
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
                .addNumberOption(x =>
                    x.setName('switch')
                        .setDescription('Switch your Pokemon')
                        .setMaxValue(6)
                        .setMinValue(1)
                )
                .addBooleanOption(x =>
                    x.setName('mega')
                        .setDescription('Mega Evolve your Pokemon')
                )
                .addBooleanOption(x =>
                    x.setName('gmax')
                        .setDescription('Gmax Evolve your Pokemon')
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
            msg.user.player = new Player(msg.user.id, msg.client);

        // Execute the command based on subcommand
        switch (msg.options.getSubcommand()) {
            case 'start': {

                const opponent1 = msg.options.getUser('opponent-1');
                const opponent2 = msg.options.getUser('opponent-2');
                const ally = msg.options.getUser('ally');
                const multiplayer = msg.options.getBoolean('multiplayer') || false;

                // Start the battle
                const player = msg.user.player;

                await player.fetchPokemon(msg.client.postgres);

                const opponent = new Player({ id: opponent1 });

                await opponent.fetch(msg.client.postgres);

                await opponent.fetchPokemon(msg.client.postgres);

                console.log(player, opponent);

                return msg.reply('Battle started!');

            }
            case 'actions':
            case 'view':
            default:
                return msg.reply("Unknown subcommand.");
        }

    }
}