import { SlashCommandBuilder } from "discord.js";
import commandsInit from "../../Utilities/Core/commandsInit.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reload Cache')
        .addBooleanOption(x => x.setName("reset-states").setDescription("[Admin Only]"))
        .addBooleanOption(x => x.setName("reset-commands-rest").setDescription("[Admin Only]"))
        .addBooleanOption(x => x.setName("reset-commands").setDescription("[Admin Only]"))
        .addBooleanOption(x => x.setName("git-pull").setDescription("[Admin Only]")),
    async execute(msg) {
        if (process.env.DEVIDS && JSON.parse(process.env.DEVIDS).includes(msg.user.id)) {

            if (msg.options.getBoolean('git-pull')) {
                await msg.reply("Git Pulling");
                return (async () => {
                    const { default: child_process } = await import("child_process");
                    child_process.exec("git pull && pm2 restart dev", () => { });
                })();
            }

            const resetCommands = msg.options.getBoolean('reset-commands');

            if (msg.options.getBoolean('reset-states')) {
                await msg.client.redis.del(msg.user.id + '-duel');
                return msg.reply("Pass");
            }

            if (resetCommands) {

                try {
                    await msg.client.cluster.broadcastEval('this.commandsInit(undefined, this, ' + (!!msg.options.getBoolean('reset-commands-rest')).toString() + ')')
                    await msg.reply("Commands reloaded");
                } catch (error) {
                    console.log(error);
                    await msg.reply("Error occurred");
                }

                return;
            }

            try {
                msg.user.info = (await msg.client.postgres`SELECT * FROM users WHERE id = ${msg.user.id}`)?.[0];
                msg.reply("Reloaded");
            } catch (error) {
                console.log(error);
                msg.reply("Error");
            }
        }
    }
}
