async function interactionCreateHandler(event) {
    let msg = event;

    if (!msg.guild || (msg.member && msg.member.user.bot))
        return;

    msg.reply("Interaction Found, good job");
}

export default interactionCreateHandler;