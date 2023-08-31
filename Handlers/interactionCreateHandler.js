async function interactionCreateHandler(event) {
    let msg = event;

    if (!msg.guild || (msg.member && msg.member.user.bot))
        return;

    // Init Channel
    if (!msg.channel.info) {
        msg.channel.info = await msg.client.prisma.channels.findFirst({
            where: {
                id: BigInt(msg.channel.id)
            }
        }) || {};
        const configs = (await msg.client.prisma.command_configuration.findMany({
            where: {
                channel_id: BigInt(msg.channel.id)
            }
        }) || []).map(x => ({ [x.command]: x }))
        msg.channel.configs = configs.length ? Object.assign(...configs) : {};
    }

    // Init Guild
    if (!msg.guild.info) {
        msg.guild.info = await msg.client.prisma.guilds.findFirst({
            where: {
                id: BigInt(msg.guild.id)
            }
        }) || {};
        const configs = (await msg.client.prisma.command_configuration.findMany({
            where: {
                guild_id: BigInt(msg.guild.id)
            }
        }) || []).map(x => ({ [x.command]: x }))
        msg.guild.configs = configs.length ? Object.assign(...configs) : {};
    }

    if (msg.client.commands.get(msg.commandName))
        return msg.client.commands.get(msg.commandName)(msg);

    // msg.reply("Interaction Found, good job");
}

export default interactionCreateHandler;