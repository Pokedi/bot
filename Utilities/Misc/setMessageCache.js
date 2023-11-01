import Player from "../../Classes/player.js";

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

    if (msg.author && !msg.author.player) msg.author.player = new Player(msg.author), await msg.author.player.fetchColumns(msg.client.postgres, "started, id, locale");

    if (msg.user && !msg.user.player) msg.user.player = new Player(msg.user), await msg.user.player.fetchColumns(msg.client.postgres, "started, id, locale");

    return true;
}