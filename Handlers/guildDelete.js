import { WebhookClient } from "discord.js";

const webHook = new WebhookClient({ url: process.env.JOINWEBHOOK });

export default async function guildDelete(guild) {

    try {

        const owner = await guild.fetchOwner();

        await webHook.send({
            embeds: [{
                title: `${guild.name} - ${guild.id}`,
                color: 16711680,
                thumbnail: {
                    url: guild.iconURL() || null
                },
                fields: [{
                    name: "Creator",
                    value: (owner ? owner.user.username : "Error") + ` ${guild.ownerId}`,
                    inline: true
                }, {
                    name: "Members",
                    value: "Information Unavailable",
                    inline: true
                }]
            }]
        });

    } catch (error) {
        console.log(error);
    }

}