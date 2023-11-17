import { SlashCommandBuilder } from "discord.js";
import generateHatchery from "../../Utilities/Pokemon/generateHatchery.js";
import Player from "../../Classes/player.js";
import getDominantColor from "../../Utilities/Misc/getDominantColor.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('hatchery')
        // .addIntegerOption(z => z.setName("slot").setDescription("Monitor or Set the slot you wish your Egg to be in"))
        // .addIntegerOption(z => z.setName("egg-id").setDescription("The ID of the Egg you wish to add to the Slot"))
        // .addBooleanOption(z => z.setName("buy-first-slot").setDescription("Buy your first Slot if you haven't already!"))
        .setDescription('Incubate your eggs, and see what mysteries hide behind them')
        .addSubcommand(x => x
            .setName("view")
            .setDescription("View your hatchery")
            .addIntegerOption(z => z.setName("slot").setDescription("Monitor the slot of your Egg"))
        )
        .addSubcommand(x => x
            .setName("set")
            .setDescription("Set the Egg to keep close in your journey")
            .addIntegerOption(z => z.setName("slot").setDescription("Set the slot of your Egg"))
            .addIntegerOption(z => z.setName("egg-id").setDescription("The ID of the Egg you wish to add to the Slot").setRequired(true))
        )
        .addSubcommand(x => x
            .setName("shop")
            .setDescription("Buy available Slots")
            .addBooleanOption(z => z.setName("first-slot").setDescription("Buy your first Slot if you haven't already!"))
        )
    ,
    async execute(msg) {

        // Prepare Slot
        let slot = msg.options.getString("slot") || 0;

        // Check Player
        const player = new Player({ id: msg.user.id });

        // Fetch Columns
        await player.fetchColumns(msg.client.postgres, "started, bal");

        if (!player.started)
            return msg.reply("You have not started your adventure");

        // Ready Hatchery
        const hatchery = await player.fetchHatchery(msg.client.postgres);

        // Check if User wishes to Set an Egg to its Slot
        if (msg.options.getSubcommand() == "set") {

            const eggID = msg.options.getInteger("egg-id");

            const foundSlot = (hatchery.find(x => x.slot == (slot || 1)));

            if (!foundSlot)
                return msg.reply("Sorry but that nest is currently unavailable");

            const [foundEgg] = await msg.client.postgres`SELECT id FROM pokemon WHERE idx = ${eggID} AND user_id = ${player.id} AND pokemon = 'egg'`;

            if (!foundEgg)
                return msg.reply("Sorry but that either isn't an egg or doesn't exist at all");

            await msg.client.postgres`UPDATE hatchery SET egg_id = ${foundEgg.id} WHERE slot = ${slot || 1} AND user_id = ${player.id}`;

            return msg.reply(`Egg #\`${eggID}\` was successfully set to Nest #${slot || 1}`)
        }

        // Check if User wants to buy a Nest
        if (msg.options.getBoolean("first-slot")) {

            // Reject if already bought
            if (hatchery.length)
                return msg.reply("You already have a Nest ready for you!");

            if (player.bal < 5000)
                return msg.reply("You do not have enough money to support a family yet. You require 5000c at least.");

            const result = await msg.client.postgres.begin(sql => [
                sql`UPDATE users SET bal = bal - 5000 WHERE id = ${msg.user.id}`,
                sql`INSERT INTO hatchery ${sql({
                    user_id: msg.user.id,
                    slot: 1,
                    timestamp: new Date()
                })}`
            ]);

            if (result)
                return msg.reply("The first nest suddenly feels warmer...");

            return msg.reply("Failed to warm nest");
        }

        // Return if User wishes to see Hatchery
        if (!slot)
            msg.reply({
                files: [{
                    attachment: await generateHatchery(hatchery.map(x => x.slot)),
                    name: "hatchery.png"
                }],
                embeds: [{
                    color: 14861714,
                    title: "Let's see how everyone's doing... ♥",
                    image: {
                        url: "attachment://hatchery.png"
                    }
                }]
            });
    }
};
