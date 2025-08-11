import { SlashCommandBuilder } from "discord.js";
import commandsInit from "../../Utilities/Core/commandsInit.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('reload')
        .setNameLocalizations({
            'pt-BR': 'recarregar',
            'es-ES': 'recargar',
            'de': 'neuladen',
            'fr': 'recharger',
            // 'ar': 'إعادة-تحميل'
        })
        .setDescription('Reload Cache')
        .setDescriptionLocalizations({
            'pt-BR': 'Recarregar Cache',
            'es-ES': 'Recargar Caché',
            'de': 'Cache neu laden',
            'fr': 'Recharger le Cache',
            // 'ar': 'إعادة تحميل ذاكرة التخزين المؤقت'
        })
        .addBooleanOption(x => x.setName("reset-states").setDescription("[Admin Only]")
            .setNameLocalizations({
                'pt-BR': 'resetar-estados',
                'es-ES': 'restablecer-estados',
                'de': 'zustände-zurücksetzen',
                'fr': 'réinitialiser-états',
                // 'ar': 'إعادة-تعيين-الحالات'
            })
            .setDescriptionLocalizations({
                'pt-BR': '[Apenas Admin]',
                'es-ES': '[Solo Admin]',
                'de': '[Nur Admin]',
                'fr': '[Admin seulement]',
                // 'ar': '[مسؤول فقط]'
            }))
        .addBooleanOption(x => x.setName("reset-commands-rest").setDescription("[Admin Only]")
            .setNameLocalizations({
                'pt-BR': 'resetar-comandos-rest',
                'es-ES': 'restablecer-comandos-rest',
                'de': 'befehle-zurücksetzen-rest',
                'fr': 'réinitialiser-commandes-rest',
                // 'ar': 'إعادة-تعيين-أوامر-rest'
            })
            .setDescriptionLocalizations({
                'pt-BR': '[Apenas Admin]',
                'es-ES': '[Solo Admin]',
                'de': '[Nur Admin]',
                'fr': '[Admin seulement]',
                // 'ar': '[مسؤول فقط]'
            }))
        .addBooleanOption(x => x.setName("reset-commands").setDescription("[Admin Only]")
            .setNameLocalizations({
                'pt-BR': 'resetar-comandos',
                'es-ES': 'restablecer-comandos',
                'de': 'befehle-zurücksetzen',
                'fr': 'réinitialiser-commandes',
                // 'ar': 'إعادة-تعيين-الأوامر'
            })
            .setDescriptionLocalizations({
                'pt-BR': '[Apenas Admin]',
                'es-ES': '[Solo Admin]',
                'de': '[Nur Admin]',
                'fr': '[Admin seulement]',
                // 'ar': '[مسؤول فقط]'
            }))
        .addBooleanOption(x => x.setName("git-pull").setDescription("[Admin Only]")
            .setNameLocalizations({
                'pt-BR': 'git-pull',
                'es-ES': 'git-pull',
                'de': 'git-pull',
                'fr': 'git-pull',
                // 'ar': 'git-pull'
            })
            .setDescriptionLocalizations({
                'pt-BR': '[Apenas Admin]',
                'es-ES': '[Solo Admin]',
                'de': '[Nur Admin]',
                'fr': '[Admin seulement]',
                // 'ar': '[مسؤول فقط]'
            })),
    async execute(msg) {
        if (process.env.DEVIDS && JSON.parse(process.env.DEVIDS).includes(msg.user.id)) {

            if (msg.options.getBoolean('git-pull')) {
                await msg.reply("Git Pulling");
                return (async () => {
                    const { default: child_process } = await import("child_process");
                    child_process.exec("git pull && pm2 restart pokedi" + (process.env.DEV ? "Dev" : ""), () => { });
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
