import autoComplete from "../Modules/Events/autoComplete.js";

async function interactionCreateHandler(event) {
    let msg = event;

    if (!msg.guild || (msg.member && msg.member.user.bot))
        return;

    if (msg.isAutocomplete()) return autoComplete(msg);

    // Init Channel
    if (!msg.channel.info) {
        msg.channel.info = (await msg.client.postgres`SELECT * FROM channels WHERE id = ${msg.channel.id} LIMIT 1`)?.[0] || {};

        const configs = (await msg.client.postgres`SELECT * FROM command_configuration WHERE channel_id = ${msg.channel.id}`).map(x => ({ [x.command]: x }));

        msg.channel.configs = configs.length ? Object.assign(...configs) : {};
    }

    // Init Guild
    if (!msg.guild.info) {
        msg.guild.info = (await msg.client.postgres`SELECT * FROM guilds WHERE id = ${msg.guild.id} LIMIT 1`)?.[0] || {};

        const configs = (await msg.client.postgres`SELECT * FROM command_configuration WHERE guild_id = ${msg.guild.id}`).map(x => ({ [x.command]: x }));

        msg.guild.configs = configs.length ? Object.assign(...configs) : {};
    }

    if (msg.client.commands.get(msg.commandName))
        return msg.client.commands.get(msg.commandName)(msg);

    // msg.reply("Interaction Found, good job");
}

export default interactionCreateHandler;