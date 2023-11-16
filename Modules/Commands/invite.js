import { SlashCommandBuilder } from "discord.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Invite Pokedi to share the fun with your friends!'),
    async execute(msg) {
        msg.reply("Thank you for considering to [invite](https://pokedi.xyz/invite) Pokedi. If you have any questions, join our support server by clicking the [Discord](https://pokedi.xyz) link in our website.");
    }
}
