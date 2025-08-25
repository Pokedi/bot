import i18n from "i18n";
import autoComplete from "../Modules/Events/autoComplete.js";
import setMessageCache from "../Utilities/Misc/setMessageCache.js";
import logInteractionReport from "../Utilities/User/logReport.js";
import localeMapping from "../Utilities/Misc/localeMapping.js";

async function interactionCreateHandler(msg) {

    if (!msg.guild || (msg.member && msg.member.user.bot) || msg.isModalSubmit())
        return;

    if (msg.isAutocomplete()) return autoComplete(msg);

    await setMessageCache(msg);

    i18n.setLocale(localeMapping(msg.user?.player?.locale || msg.locale || msg.channel?.configs?.locale?.config || msg.guild?.configs?.locale?.config || msg.guild.preferredLocale || "en"));

    try {
        if (msg.client.commands.get(msg.commandName))
            return logInteractionReport(msg), msg.client.commands.get(msg.commandName)(msg);
    } catch (error) {
        console.log(error);
    }
}

export default interactionCreateHandler;