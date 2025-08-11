import { SlashCommandBuilder } from "discord.js";
import { ENUM_COMMANDS, reverseENUM } from "../../Utilities/Data/enums.js";
import textTable from "text-table";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('eval')
        .setNameLocalizations({
            'pt-BR': 'avaliar',
            'es-ES': 'evaluar',
            'de': 'auswerten',
            'fr': 'évaluer',
            'ar': 'تقييم'
        })
        .setDescription('Admin command')
        .setDescriptionLocalizations({
            'pt-BR': 'Comando de administrador',
            'es-ES': 'Comando de administrador',
            'de': 'Admin-Befehl',
            'fr': 'Commande administrateur',
            'ar': 'أمر المسؤول'
        })
        .addStringOption(option => option.setName('command').setDescription('code to execute')
            .setNameLocalizations({
                'pt-BR': 'comando',
                'es-ES': 'comando',
                'de': 'befehl',
                'fr': 'commande',
                'ar': 'أمر'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'código para executar',
                'es-ES': 'código para ejecutar',
                'de': 'auszuführender Code',
                'fr': 'code à exécuter',
                'ar': 'كود للتنفيذ'
            }))
        .addStringOption(option => option.setName("command-check").setDescription("Check a command")
            .setNameLocalizations({
                'pt-BR': 'verificar-comando',
                'es-ES': 'verificar-comando',
                'de': 'befehl-prüfen',
                'fr': 'vérifier-commande',
                'ar': 'تحقق-من-الأمر'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'Verificar um comando',
                'es-ES': 'Verificar un comando',
                'de': 'Einen Befehl prüfen',
                'fr': 'Vérifier une commande',
                'ar': 'تحقق من أمر'
            }))
        .addIntegerOption(option => option.setName("order").setDescription("Select how you wish to calculate the usages")
            .setNameLocalizations({
                'pt-BR': 'ordem',
                'es-ES': 'orden',
                'de': 'reihenfolge',
                'fr': 'ordre',
                'ar': 'ترتيب'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'Selecione como você deseja calcular os usos',
                'es-ES': 'Selecciona cómo deseas calcular los usos',
                'de': 'Wählen Sie aus, wie Sie die Verwendungen berechnen möchten',
                'fr': 'Sélectionnez comment vous souhaitez calculer les utilisations',
                'ar': 'حدد كيف ترغب في حساب الاستخدامات'
            })),
    mention_support: true,
    async execute(msg) {

        if (process.env.DEVIDS && JSON.parse(process.env.DEVIDS).includes(msg.user.id)) {

            // Check if command was ran via ping or interaction
            if (msg.isMessage) {
                const content = msg.content;
                if (content) {
                    try {
                        eval(content);
                    } catch (error) {
                        console.log(error);
                        msg.reply("Error");
                    }
                } else {
                    return msg.reply("No command provided to evaluate.");
                }
            } else
                if (msg.options.getString("command")) {
                    try {
                        eval(msg.options.getString("command"));
                    } catch (error) {
                        console.log(error);
                        msg.reply("Error");
                    } finally {
                    }
                } else {
                    const returnedData = (await msg.client.postgres`SELECT command,
COUNT(*) AS command_per_hour ,
DATE_TRUNC('hour', timestamp) AS hour
FROM logs 
WHERE timestamp >= CURRENT_DATE
GROUP BY hour, command ORDER BY hour desc, command desc;`);

                    return await msg.reply({ files: [{ attachment: Buffer.from("" + textTable([].concat([returnedData.statement.columns.map(x => x.name)], returnedData.map(x => { x.hour = new Date(x.hour).getHours(); if (x.command) x.command = ENUM_COMMANDS[x.command] || '0'; return x; }).map(x => Object.values(x).map(x => x || ""))), { hsep: " | " }) + "\n"), name: "stats.txt" }] });
                }
        }
    }
}
