import { SlashCommandBuilder } from "discord.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .addStringOption(option => option.setName('page').setDescription('Page of Pokemon list'))
        .setName('pokemon')
        .setDescription('List your Pokemon'),
    async execute(msg) {
        
    }
}
