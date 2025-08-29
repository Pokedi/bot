import { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('[Admin Only]')
        // .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        // .setContexts(InteractionContextType.Guild)
        .addSubcommandGroup(x => x
            .setName('change_log')
            .setDescription('Change Logs Command Use')
        ),

    /**
    * BOY I FINALLY LEARNED HOW TO DO THIS?
    * @param {import('discord.js').ChatInputCommandInteraction} msg
    */
    async execute(msg) {

        if (!(process.env.DEVIDS && JSON.parse(process.env.DEVIDS).includes(msg.member.id))) return msg.reply('You are not allowed to use this command.');

        if (msg.options.getSubcommandGroup(false) === 'change_log') {

            if (process.env.DEVIDS && JSON.parse(process.env.DEVIDS).includes(msg.member.id)) {

                const modal = new ModalBuilder()
                    .setCustomId('change-log-modal')
                    .setTitle('Add Change Log')
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('log-type')
                                .setLabel('Log Type')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('ADD, CHANGE, FIX')
                                .setRequired(true)
                        ),
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('log-message')
                                .setLabel('Log Message')
                                .setStyle(TextInputStyle.Paragraph)
                                .setPlaceholder('This is a change log message')
                                .setRequired(true)
                        )
                    );

                await msg.showModal(modal);

            }
        }
    },
    async modalSubmit(interaction) {

        const logType = interaction.fields.getTextInputValue('log-type');
        const logMessage = interaction.fields.getTextInputValue('log-message');

        const logAuthor = interaction.user.tag;
        const guildId = interaction.guild.id;

        const rows = await interaction.client.postgres`
                            INSERT INTO change_logs (log_type, log_message, log_author, guild_id)
                            VALUES (${logType}, ${logMessage}, ${logAuthor}, ${guildId})
                            RETURNING *
                        `;

        if (rows.length > 0) {

            interaction.reply(`Change log added successfully!`);

        } else {

            interaction.reply(`Failed to add change log.`);
        }
        
    }
}
