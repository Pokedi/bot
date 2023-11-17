import { SlashCommandBuilder } from "discord.js";
import generateHatchery from "../../Utilities/Pokemon/generateHatchery.js";
import Player from "../../Classes/player.js";
import randomint from "../../Utilities/Misc/randomint.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('hatchery')
        .setDescription('Incubate your eggs, and see what mysteries hide behind them')
        .addSubcommand(x => x
            .setName("view")
            .setDescription("View your hatchery")
            .addIntegerOption(z => z.setName("slot").setDescription("Monitor the slot of your Egg").setMaxValue(4).setMinValue(1))
        )
        .addSubcommand(x => x
            .setName("set")
            .setDescription("Set the Egg to keep close in your journey")
            .addIntegerOption(z => z.setName("egg-id").setDescription("The ID of the Egg you wish to add to the Slot").setRequired(true))
            .addIntegerOption(z => z.setName("slot").setDescription("Set the slot of your Egg").setMaxValue(4).setMinValue(1))
        )
        .addSubcommand(x => x
            .setName("unset")
            .setDescription("Remove an Egg from its Nest [Progress is Reset]")
            .addIntegerOption(z => z.setName("slot").setDescription("Nest you wish to remove the egg from.").setMaxValue(4).setMinValue(1).setRequired(true))
        )
        .addSubcommand(x => x
            .setName("shop")
            .setDescription("Buy available Slots")
            .addBooleanOption(z => z.setName("first-slot").setDescription("Buy your first Slot if you haven't already!"))
        )
        .addSubcommand(x => x
            .setName("help")
            .setDescription("View the helpful information of this command")
        ),
    async execute(msg) {

        if (msg.options.getSubcommand() == "help")
            return msg.options._hoistedOptions.push({ name: "command_name", type: 3, value: "hatchery" }),
                msg.client.commands.get("help")(msg);

        // Prepare Slot
        let slot = msg.options.getInteger("slot") || 0;

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

            await msg.client.postgres`UPDATE hatchery SET egg_id = ${foundEgg.id}, count = ${1000 + randomint(3000)} WHERE slot = ${slot || 1} AND user_id = ${player.id}`;

            if (msg.user.player)
                msg.user.player.hatchery = await player.fetchHatchery(msg.client.postgres);

            return msg.reply(`Egg #\`${eggID}\` was successfully set to Nest #${slot || 1}`)

        } else if (msg.options.getSubcommand() == "unset") {

            const [row] = await msg.client.postgres`UPDATE hatchery SET egg_id = null, count = 0 WHERE slot = ${slot || 1} AND user_id = ${player.id} returning id`;

            if (!row)
                return msg.reply("You did not have an egg there to begin with...");

            return msg.reply("Successfully removed the egg from the nest... The sky is turning dark all of a sudden.");

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

        if (slot) {
            const foundSlot = (hatchery.find(x => x.slot == (slot || 1)));

            let slotImage = "empty-nest";

            if (foundSlot && foundSlot.egg_id)
                if (foundSlot.count <= 200)
                    slotImage = "hatch-nest";
                else
                    slotImage = "egg-nest";

            return msg.reply({
                files: [{
                    attachment: "../pokediAssets/hatchery/" + slotImage + ".jpg",
                    name: "nest.png"
                }],
                embeds: [{
                    color: 5002313,
                    title: "Nest #" + (slot || 1),
                    description: foundSlot ? (foundSlot.egg_id ? "Someone seems eagerly to coming out!" : "A warm bed, waiting for someone to rest!") : "An empty home... waiting for someone to return to...",
                    image: {
                        url: "attachment://nest.png"
                    },
                    footer: {
                        text: foundSlot && foundSlot.idx ? `EggID: ${foundSlot.idx}` : "One makes a soul, two make a pair, three make a family."
                    }
                }]
            })
        }
    }
};
