import { WebhookClient } from "discord.js";
import sql from "../Modules/Database/postgres.js";

const webHook = new WebhookClient({ url: process.env.JOINWEBHOOK });

export default async function guildCreate(guild) {

    try {

        const [row] = await sql`INSERT INTO guilds ${sql({
            id: guild.id
        })} ON CONFLICT (id) DO NOTHING RETURNING *;`

        const owner = await guild.fetchOwner();

        const { approximateMemberCount } = await guild.fetch();

        await webHook.send({
            embeds: [{
                title: `${guild.name} - ${guild.id}`,
                color: 65280,
                thumbnail: {
                    url: guild.iconURL() || null
                },
                fields: [{
                    name: "Creator",
                    value: (owner ? owner.user.username : "Error") + ` ${guild.ownerId}`,
                    inline: true
                }, {
                    name: "Members",
                    value: (approximateMemberCount || 0).toString(),
                    inline: true
                }]
            }]
        })

    } catch (error) {
        console.log(error);
    }

}