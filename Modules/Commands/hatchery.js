import { SlashCommandBuilder } from "discord.js";
import generateHatchery from "../../Utilities/Pokemon/generateHatchery.js";
import Player from "../../Classes/player.js";
export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('hatchery')
        .addIntegerOption(z => z.setName("slot").setDescription("Monitor the slot you wish to check your Egg of"))
        .setDescription('Incubate your eggs, and see what mysteries hide behind them'),
    async execute(msg) {
        // Prepare Slot
        const slot = msg.options.getString("slot") || 0;
        const player = new Player({ id: msg.user.id });
        await player.fetchColumns("started");
        if (!player.started)
            return msg.reply("You have not started your adventure");
        if (!slot)
            msg.reply({
                files: [{
                        attachment: await generateHatchery(player),
                        name: "profile.png"
                    }],
                embeds: [{
                        title: "Let's see how everyone's doing... ♥",
                        image: {
                            url: "attachment://profile.png"
                        }
                    }]
            });
    }
};
