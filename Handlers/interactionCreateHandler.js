async function interactionCreateHandler(event) {
    let msg = event;

    if (!msg.guild || (msg.member && msg.member.user.bot))
        return;

    if (msg.client.commands.get(msg.commandName)) return msg.client.commands.get(msg.commandName)(msg);

    msg.reply("Interaction Found, good job");
}

export default interactionCreateHandler;