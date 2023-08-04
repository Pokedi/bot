import { SlashCommandBuilder } from "discord.js";
import commandsInit from "../../Utilities/Core/commandsInit.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reload Cache')
        .addBooleanOption(x => x.setName("reset-commands").setDescription("[Admin Only]")),
    async execute(msg) {
        if (process.env.DEVIDS && JSON.parse(process.env.DEVIDS).includes(msg.user.id)) {
            const resetCommands = msg.options.getBoolean('reset-commands');

            if (resetCommands) {

                try {
                    await commandsInit(undefined, msg.client);
                    await msg.reply("Commands reloaded");
                } catch (error) {
                    console.log(error);
                    await msg.reply("Error occurred");
                }

                return;
            }

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
