import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    MessageFlags
} from "discord.js";

function buttonMaker({ users = [], disable = [] }) {
    const allDisabled = users.every(u => disable.includes(u));

    const description = users.map(userId => {
        const isDisabled = disable.includes(userId);
        const mention = `<@${userId}>`;
        return isDisabled
            ? `~~${mention}'s verification pending~~`
            : `${mention}'s verification pending`;
    }).join("\n");

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("approve")
            .setLabel("✅ Approve")
            .setStyle(ButtonStyle.Success)
            .setDisabled(allDisabled),
        new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("❌ Cancel")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(allDisabled)
    );

    return [row, description];
}

export async function buttonVerification({
    interaction,
    filter,
    time = 15000,
    users = [],
    textContent
}) {
    if (!users.length) users = [interaction.user.id];

    let disable = [];

    const [row, description] = buttonMaker({ users, disable });

    const message = await interaction.reply({
        content: textContent ?? "",
        embeds: [{ description }],
        components: [row],
        fetchReply: true
    });

    return new Promise((resolve) => {
        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time,
            filter: i =>
                (filter?.(i) ??
                    (users.includes(i.user.id) &&
                        (i.customId === "approve" || i.customId === "cancel")))
        });

        collector.on("collect", async i => {
            await i.reply({ content: "<3", flags: MessageFlags.Ephemeral });

            if (i.customId === "cancel") {
                await message.edit({
                    content: "This interaction was cancelled.",
                    components: []
                });
                collector.stop("cancelled");
                return resolve(false);
            }

            // Approve logic
            if (!disable.includes(i.user.id)) {
                disable.push(i.user.id);
                const [newRow, newDesc] = buttonMaker({ users, disable });

                await message.edit({
                    embeds: [{ description: newDesc }],
                    components: disable.length === users.length ? [] : [newRow]
                });

                if (disable.length === users.length) {
                    collector.stop("all approved");
                    return resolve(true);
                }
            }
        });

        collector.on("end", () => {
            resolve(disable.length === users.length);
        });
    });
}

export default buttonVerification;
