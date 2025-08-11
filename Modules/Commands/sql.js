import { SlashCommandBuilder } from "discord.js";
import textTable from "text-table";
import pokemondb from "../Database/pokedb.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('sql')
        .setNameLocalizations({
            'pt-BR': 'sql',
            'es-ES': 'sql',
            'de': 'sql',
            'fr': 'sql',
            'ar': 'sql'
        })
        .setDescription('Admin command')
        .setDescriptionLocalizations({
            'pt-BR': 'Comando de administrador',
            'es-ES': 'Comando de administrador',
            'de': 'Admin-Befehl',
            'fr': 'Commande administrateur',
            'ar': 'أمر المسؤول'
        })
        .addStringOption(option => option.setName('command').setDescription('code to execute').setRequired(true)
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
        .addBooleanOption(option => option.setName('pokedb').setDescription('Switch to PokemonDB')
            .setNameLocalizations({
                'pt-BR': 'pokedb',
                'es-ES': 'pokedb',
                'de': 'pokedb',
                'fr': 'pokedb',
                'ar': 'pokedb'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'Mudar para PokemonDB',
                'es-ES': 'Cambiar a PokemonDB',
                'de': 'Wechsle zu PokemonDB',
                'fr': 'Passer à PokemonDB',
                'ar': 'التبديل إلى PokemonDB'
            })),
    async execute(msg) {
        if (process.env.DEVIDS && JSON.parse(process.env.DEVIDS).includes(msg.user.id)) {
            try {
                const returnedData = msg.options.getBoolean("pokedb") ? await pokemondb.unsafe(msg.options.getString("command")) : await msg.client.postgres.unsafe(msg.options.getString("command"));
                try {
                    await msg.reply("```JS\n" + textTable([].concat([returnedData.statement.columns.map(x => x.name)], returnedData.map(x => Object.values(x).map(x => x || ""))), { hsep: " | " }) + "\n```")
                } catch (error) {
                    try {
                        await msg.reply("```JSON\n" + JSON.stringify(returnedData, null, 4) + "\n```");
                    } catch (error) {
                        await msg.reply({ files: [{ attachment: Buffer.from("" + textTable([].concat([returnedData.statement.columns.map(x => x.name)], returnedData.map(x => Object.values(x).map(x => x || ""))), { hsep: " | " }) + "\n"), name: "hello.txt" }] })
                    }
                }
            } catch (error) {
                console.log(error);
                msg.reply("Error");
            } finally {
            }
        }
    }
}
