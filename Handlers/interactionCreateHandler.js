import { createLocale } from "../Classes/lang.js";
import autoComplete from "../Modules/Events/autoComplete.js";
import setMessageCache from "../Utilities/Misc/setMessageCache.js";
import logInteractionReport from "../Utilities/User/logReport.js";

async function interactionCreateHandler(msg) {

    if (!msg.guild || (msg.member && msg.member.user.bot) || msg.isModalSubmit())
        return;

    if (msg.isAutocomplete()) return autoComplete(msg);

    await setMessageCache(msg);

    try {
        if (msg.client.commands.get(msg.commandName))
            return logInteractionReport(msg), msg.client.commands.get(msg.commandName)(msg);
    } catch (error) {
        console.log(error);
    }
}

export default interactionCreateHandler;