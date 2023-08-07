const { SlashCommandBuilder } = require('@discordjs/builders');
module.exports = {
    help: "",
    data: new SlashCommandBuilder()
        .setName('no')
        .setDescription('No.'),
    async function(msg) {
        return msg.reply({ ephemeral: true, content: "👎" });
    }
}