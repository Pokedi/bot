import { SlashCommandBuilder } from "discord.js";
import Player from "../../Classes/player.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('battle')
        .setDescription('Let er Rip! Oh wait, wrong one, AUTOBOTS! ROLLOUT!')
        .addSubcommand(x => x
            .setName('start')
            .setDescription('Use this command to start your battle')
            .addMentionableOption(x => x
                .setName('Opponent 1')
            )
            .addMentionableOption(x => x
                .setName('Opponent 2')
            )
            .addMentionableOption(x => x
                .setName('Ally')
                .setDescription("Only available if GameMode is Multiplayer")
            )
            .addBooleanOption(x => x
                .setName('Multiplayer')
                .setDescription("Multiplayer 2v2")
            )
        )
        .addSubcommand(x => x
            .setName('actions')
            .setDescription('Actions include attacking, switching, healing, and what not.')
            .addNumberOption(x => x
                .setName('attack')
                .setDescription('Attack Move')
                .setMaxValue(4)
                .setMinValue(1)
            )
            .addNumberOption(x => x
                .setName('target')
                .addChoices({
                    name: 'Auto',
                    value: 0
                }, {
                    name: 'Opponent 1',
                    value: 1
                }, {
                    name: 'Opponent 2',
                    value: 2
                }, {
                    name: 'Ally',
                    value: 3
                })
            )
            .addNumberOption(x => x
                .setName('switch')
                .setDescription('Switch your Pokemon')
                .setMaxValue(6)
                .setMinValue(1)
            )
            .addBooleanOption(x => x
                .setName('mega')
                .setDescription('Mega Evolve your Pokemon')
            )
            .addBooleanOption(x => x
                .setName('gmax')
                .setDescription('Gmax Evolve your Pokemon')
            )
            .addBooleanOption(x => x
                .setName('run-away')
                .setDescription('Run away!')
            )
        )
        .addSubcommand(x => x
            .setName('view')
            .setDescription('View Details on the Duel, User, etc.')
            .addBooleanOption(x => x
                .setName('team')
                .setDescription('View your Team')
            )
            .addBooleanOption(x => x
                .setName('moves')
                .setDescription('Check out your available moves')
            )
        ),
    async execute(msg) {
    }
}