import { SlashCommandBuilder } from "discord.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Vote for Pokedi to help Support it!'),
    async execute(msg) {
        msg.reply("Thank you for considering to [vote](https://pokedi.xyz/vote) for Pokedi. Any and all help will be greatly appreciated");
    }
}
