import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";

const buttonMaker = ({ users = [], disable = [], title = "main" }) => {
    let content = '';

    let alp = [];

    const check = !users.filter(x => !disable.includes(x)).length;

    for (let i = 0; i < users.length; i++) {
        const user_check = disable.includes(users[i]);
        content += `${user_check ? "~~" : ""}<@${users[i]}>'s verification pending${user_check ? "~~" : ""}\n`;
    }

    return [new ActionRowBuilder().addComponents(new ButtonBuilder()
        .setLabel('✅')
        .setCustomId('approve')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(check),
        new ButtonBuilder()
            .setLabel('❌')
            .setCustomId('cancel')
            .setStyle(ButtonStyle.Primary)), content];
}

async function buttonVerification({ interaction, filter, time = 15000, button_id, users = [] }) {
    return new Promise(async (resolve) => {

        if (!users[0]) users = [interaction.user.id];

        const [buttons, content] = buttonMaker({ users, title: button_id || "trade" });

        const replied = await interaction.reply({ components: [buttons], embeds: [{ description: content }], fetchReply: true });

        let disable = [];

        let final_filter = filter || (i => i.message.id == replied.id && users.includes(i.user.id) && (i.customId == "cancel" || i.customId == "approve"));

        const collector = interaction.channel.createMessageComponentCollector({
            componentType: ComponentType.Button, time: 25000
        });

        collector.on('collect', async i => {
            // await i.deferUpdate();
            if (!final_filter(i)) return;
            try {
                const u = i.user.id;
                if (i.customId == "cancel") {
                    return i.update({ content: "This interaction was cancelled", components: [] }),
                        resolve(false);
                } else {
                    if (!disable.includes(u)) {
                        disable.push(u);
                        const [buttons, content] = buttonMaker({ users, disable });
                        await i.update({ embeds: [{ description: content }], components: (disable.length != users.length) ? [buttons] : [] });
                        (disable.length == users.length && resolve(true));
                    } else {
                        i.deferUpdate();
                    }
                }
            } catch (error) {

            }
        });

        collector.on('end', collected => { if (disable.length == users.length) { resolve(true); } else { resolve(false); } });
    });
}


export default buttonVerification;