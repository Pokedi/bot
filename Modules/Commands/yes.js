const { SlashCommandBuilder } = require('@discordjs/builders');
module.exports = {
    help: "",
    data: new SlashCommandBuilder()
        .setName('yes')
        .setDescription('Yes.'),
    async function(msg) {
        return msg.reply({ ephemeral: true, content: "👍" });
    }
}