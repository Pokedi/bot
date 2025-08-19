import { SlashCommandBuilder } from "discord.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('battle')
        .setDescription('Let er Rip! Oh wait, wrong one, AUTOBOTS! ROLLOUT!'),
    async execute(msg) {

        return msg.reply("Please use `/duel` instead. This command was shut-off after delicious progress was made.");

    }
}