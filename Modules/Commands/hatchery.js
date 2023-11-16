import { SlashCommandBuilder } from "discord.js";
export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('hatchery')
        .addIntegerOption(z => z.setName("slot").setDescription("Monitor the slot you wish to check your Egg of"))
        .setDescription('Incubate your eggs, and see what mysteries hide behind them'),
    async execute(msg) {
        // Prepare Slot
        const slot = msg.options.getString("slot") || 0;
    }
};
