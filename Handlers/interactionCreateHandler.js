import { prisma } from "../Services/Main/index.js";

async function interactionCreateHandler(event) {
    let msg = event;

    if (!msg.guild || (msg.member && msg.member.user.bot))
        return;

    // Init User
    if (!msg.user.info) msg.user.info = await prisma.users.findUnique({ where: { id: BigInt(msg.user.id) } }) || {};

    if (msg.client.commands.get(msg.commandName)) return msg.client.commands.get(msg.commandName)(msg);

    // msg.reply("Interaction Found, good job");
}

export default interactionCreateHandler;