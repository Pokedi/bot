import i18n from "i18n";
import autoComplete from "../Modules/Events/autoComplete.js";
import setMessageCache from "../Utilities/Misc/setMessageCache.js";
import logInteractionReport from "../Utilities/User/logReport.js";
import localeMapping from "../Utilities/Misc/localeMapping.js";
import { EmbedBuilder } from "discord.js";

/**
* @param {import('discord.js').ChatInputCommandInteraction} msg
*/
async function interactionCreateHandler(msg) {

    if (!msg.guild || (msg.member && msg.member.user.bot))
        return;

    if (msg.isModalSubmit() && msg.commandName == "admin")
        return (await import('../Modules/Commands/admin.js')).default.modalSubmit(msg);

    if (msg.isAutocomplete()) return autoComplete(msg);

    await setMessageCache(msg);

    i18n.setLocale(localeMapping(msg.user?.player?.locale || msg.locale || msg.channel?.configs?.locale?.config || msg.guild?.configs?.locale?.config || msg.guild.preferredLocale || "en"));

    // Welcome Message
    if (msg.guild?.info?.id && !msg.guild.info.welcome_sent) {

        const welcomeEmbed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle(i18n.__('welcome.title'))
            .setDescription(
                i18n.__('welcome.description')
            )
            .addFields(
                { name: '🧑‍🚀 ' + i18n.__('welcome.fields.started'), value: i18n.__('welcome.fields.started_text'), inline: false },
                { name: '🎒 ' + i18n.__('welcome.fields.inventory'), value: i18n.__('welcome.fields.inventory_text'), inline: false },
                { name: '🛒 ' + i18n.__('welcome.fields.shop'), value: i18n.__('welcome.fields.shop_text'), inline: false },
                { name: '🏆 ' + i18n.__('welcome.fields.battles'), value: i18n.__('welcome.fields.battles_text'), inline: false },
                { name: '🔍 ' + i18n.__('welcome.fields.dex'), value: i18n.__('welcome.fields.dex_text'), inline: false },
                { name: '🎁 ' + i18n.__('welcome.fields.hatchery'), value: i18n.__('welcome.fields.hatchery_text'), inline: false },
                { name: '🛠️ ' + i18n.__('welcome.fields.settings'), value: i18n.__('welcome.fields.settings_text'), inline: false },
                { name: '🔗 ' + i18n.__('welcome.fields.other'), value: i18n.__('welcome.fields.other_text'), inline: false }
            )
            .setFooter({ text: i18n.__('welcome.footer'), iconURL: "https://cdn-icons-png.flaticon.com/512/188/188987.png" });

        msg.channel.send({ embeds: [welcomeEmbed] }).then(async x => {

            // Sent successfully
            await msg.client.postgres`UPDATE guilds SET welcome_sent = true WHERE id = ${msg.guild.id}`;

            msg.guild.info.welcome_sent = true;

        });

    }

    try {
        if (msg.client.commands.get(msg.commandName))
            return logInteractionReport(msg), msg.client.commands.get(msg.commandName)(msg);
    } catch (error) {
        console.log(error);
    }
}

export default interactionCreateHandler;