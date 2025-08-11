import { MessageFlags, SlashCommandBuilder } from "discord.js";
import Player from "../../Classes/player.js";
import capitalize from "../../Utilities/Misc/capitalize.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('team')
        .setNameLocalizations({
            'pt-BR': 'equipe',
            'es-ES': 'equipo',
            'de': 'team',
            'fr': 'équipe',
            'ar': 'فريق'
        })
        .setDescription('Check your Pokemon team out!')
        .setDescriptionLocalizations({
            'pt-BR': 'Confira sua equipe de Pokémon!',
            'es-ES': '¡Echa un vistazo a tu equipo de Pokémon!',
            'de': 'Schau dir dein Pokémon-Team an!',
            'fr': 'Consultez votre équipe de Pokémon!',
            'ar': 'تحقق من فريق بوكيمونك!'
        })
        .addBooleanOption(option => option.setName("help").setDescription("View details on how to use this command")
            .setNameLocalizations({
                'pt-BR': 'ajuda',
                'es-ES': 'ayuda',
                'de': 'hilfe',
                'fr': 'aide',
                'ar': 'مساعدة'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'Veja detalhes sobre como usar este comando',
                'es-ES': 'Ver detalles sobre cómo usar este comando',
                'de': 'Details zur Verwendung dieses Befehls anzeigen',
                'fr': 'Voir les détails sur la façon d\'utiliser cette commande',
                'ar': 'عرض تفاصيل حول كيفية استخدام هذا الأمر'
            })),
    alias: ["t"],
    mention_support: true,
    async execute(msg) {

        // Redirect to Help
        if (!msg.isMessage && msg.options.getBoolean("help"))
            return msg.options._hoistedOptions.push({ name: "command_name", type: 3, value: "select" }),
                msg.client.commands.get("help")(msg);

        const userDB = new Player({ id: BigInt(msg.user.id) });

        await userDB.fetch(msg.client.postgres);

        if (!userDB.started) return msg.reply({ flags: MessageFlags.Ephemeral, content: "User not found" });

        if (!userDB.selected || !userDB.selected[0]) return msg.reply({ flags: MessageFlags.Ephemeral, content: "No one's home..." });

        const selectedPokemon = await msg.client.postgres`SELECT id, idx, level, name, pokemon FROM pokemon WHERE id in ${msg.client.postgres(userDB.selected)}`;

        await msg.reply({
            embeds: [{
                title: "Your Team",
                fields: (() => {
                    // return [];
                    return userDB.selected.map(x => selectedPokemon.find(z => z.id == x)).filter(x => x).map((x, i) => {
                        return {
                            name: capitalize(x.name || x.pokemon) + ` (Nº ${x.idx}) _ _ _ _ _ _`,
                            value: `**Slot**: ${i + 1}\n**Level** ${x.level}`,
                            inline: true
                        }
                    }
                    );
                }
                )(),
                color: 7506394,
                footer: {
                    text: `/select Slot: <slot> ID: <pokemon id> - Organize your pokemon\n/info <id> - View your Pokemon`
                }
            }]
        });
    }
}