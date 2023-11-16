import retryUser from "./retryUser.js";

export default async (msg) => {
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

    if (msg.author && !msg.author.player) msg.author.player = await retryUser(msg.author, msg.client.postgres);

    if (msg.user && !msg.user.player) msg.user.player = await retryUser(msg.user, msg.client.postgres);

    return true;
}