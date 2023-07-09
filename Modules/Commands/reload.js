import { SlashCommandBuilder } from "discord.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reload Cache'),
    async execute(msg) {
        if (process.env.DEVIDS && JSON.parse(process.env.DEVIDS).includes(msg.user.id)) {
            try {
                msg.user.info = await msg.client.prisma.users.findUnique({ where: { id: BigInt(msg.user.id) } }) || {};
                msg.reply("Reloaded");
            } catch (error) {
                console.log(error);
                msg.reply("Error");
            }
        }
    }
}
