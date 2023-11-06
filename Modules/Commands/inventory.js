import { AttachmentBuilder, SlashCommandBuilder } from "discord.js";
import pokemondb from "../Database/pokedb.js";
// Crates
import { generateCrate, randomSelectCrate } from "../../Services/Server/utils/determineCrate.js";
import generateCrateRewardSQL from "../../Services/Server/utils/generateCrateRewardSQL.js";

// Grab Dominant Color
import getDominantColor from "../../Utilities/Misc/getDominantColor.js";

import { existsSync } from "fs";

import path from "path";

const __dirname = path.resolve(path.dirname(''));

function processCatName(category_name) {
    switch (category_name) {
        case "Medicine":
            return "🍼";
        case "Healing":
        case "Revival":
        case "Status cures":
            return "🌿";
        case "Special balls":
        case "Standard balls":
            return "🖲️";
        case "Picky healing":
        case "In a pinch":
            return "🍒";
        default:
            return "";
    }
}

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('inventory')
        .addIntegerOption(x => x
            .setName("page")
            .setDescription("Page of Listing")
        )
        .addIntegerOption(x => x
            .setName("item-id")
            .setDescription("Check out the item details!")
            .setAutocomplete(true)
        )
        .addIntegerOption(x => x
            .setName("use")
            .setDescription("Use your Crates through this command")
            .setMinValue(1)
            .setMaxValue(100)
        )
        .setDescription('Check out your items! Get em from the /shop or through the crates.'),
    async execute(msg) {
        const page = (msg.options.getInteger("page") || 1) - 1;
        const itemID = msg.options.getInteger("item-id");
        const consume = msg.options.getInteger("use");

        if (consume && itemID) {

            // Check if User has it
            const [userItem] = await msg.client.postgres`SELECT amount FROM user_inventory WHERE user_id = ${msg.user.id} AND item_id = ${itemID}`;

            // Reject if Not Found
            if (!userItem || !userItem.amount)
                return await msg.reply("You do not have that item");

            // Reject if the User is being greedy
            if (userItem.amount < consume)
                return await msg.reply("You do not have enough of that");

            // Select Crate to Validate
            const crate = randomSelectCrate(itemID);

            // Reject if Crate not Found in DB
            if (!crate)
                return msg.reply("Could not find that Crate");

            // Render Crate Items
            const rewards = [];
            for (let i = 0; i < consume; i++) {
                const { items } = generateCrate(undefined, crate);

                rewards.push(items);
            }

            // Sort out Crate Items
            let result = [];
            rewards.flatMap(x => x).filter(x => x).reduce(function (res, value) {
                if (!res[value.type + "-" + value.item_id]) {
                    res[value.type + "-" + value.item_id] = { type: value.type, amount: 0, item_id: value.item_id, name: value.name };
                    result.push(res[value.type + "-" + value.item_id])
                }
                res[value.type + "-" + value.item_id].amount += value.amount;
                return res;
            }, {});

            // Generate Reward and Reduce
            await msg.client.postgres.begin(x => generateCrateRewardSQL(result, msg.user.id, x).concat([x`UPDATE user_inventory SET amount = amount - ${consume} WHERE item_id = ${itemID} AND user_id = ${msg.user.id}`]));

            return await msg.reply(`Congrats! You just opened up the ${crate.name}! Here are your rewards:\n${result.map(x => `- ${x.name} (${x.amount})`).join("\n")}`)
        }

        if (itemID) {
            const [item] = await pokemondb`SELECT itn.name, i.cost, i.id, icn.name as category_name, iet.effect, i.name as _id FROM pokemon_v2_item as i
            LEFT JOIN pokemon_v2_itemname as itn ON itn.item_id = i.id AND itn.language_id = 9
            LEFT JOIN pokemon_v2_itemcategoryname as icn ON i.item_category_id = icn.item_category_id AND icn.language_id = 9
            LEFT JOIN pokemon_v2_itemeffecttext as iet ON iet.item_id = i.id AND iet.language_id = 9
            WHERE i.id = ${itemID}`;

            if (!item)
                return await msg.reply("Item not found.");

            const [userInventory] = await msg.client.postgres`SELECT amount FROM user_inventory WHERE user_id = ${msg.user.id} AND item_id = ${item.id}`;

            const sprite = (existsSync(path.join(__dirname, `../pokedi/card/itemsprites/${item._id}.png`)) ? `../pokedi/card/itemsprites/${item._id}.png` : `../pokedi/card/itemsprites/master-ball.png`);

            const dominantColor = await getDominantColor(sprite, true);

            const file = new AttachmentBuilder(sprite);

            return msg.reply({
                files: [file],
                embeds: [{
                    color: dominantColor,
                    title: `${item.name} #${item.id} ${processCatName(item.category_name)}`,
                    description: item.effect || "No description provided",
                    fields: [{
                        name: "Amount",
                        value: userInventory?.amount || "None",
                        inline: true
                    }, {
                        name: "Cost",
                        value: item.cost ? item.cost + " credits" : "No value provided",
                        inline: true
                    }, {
                        name: "Category",
                        value: item.category_name || "Not specified",
                        inline: true
                    }],
                    author: {
                        icon_url: 'attachment://' + sprite.split("itemsprites/")[1],
                        name: item.name + " details"
                    }
                }]
            })
        }

        const usersInventory = await msg.client.postgres`SELECT * FROM user_inventory WHERE user_id = ${msg.user.id} AND amount > 0 OFFSET ${page * 9}`;

        if (!usersInventory.length)
            return await msg.reply("You have no items...");

        const items = await pokemondb`SELECT itn.name, i.cost, i.id, icn.name as category_name, iet.short_effect, i.name as _id FROM pokemon_v2_item as i
LEFT JOIN pokemon_v2_itemname as itn ON itn.item_id = i.id AND itn.language_id = 9
LEFT JOIN pokemon_v2_itemcategoryname as icn ON i.item_category_id = icn.item_category_id AND icn.language_id = 9
LEFT JOIN pokemon_v2_itemeffecttext as iet ON iet.item_id = i.id AND iet.language_id = 9
WHERE i.id in ${pokemondb(usersInventory.map(x => x.item_id))}`;

        await msg.reply({
            embeds: [{
                title: `📦 Your Inventory 📦`,
                fields: items.map(x => ({
                    name: x.name + " #" + x.id + " " + processCatName(x.category_name),
                    value: `- **Amount**: ${usersInventory.find(y => y.item_id == x.id)?.amount || "None"}
- **Category**: ${x.category_name}
- **Cost**: ${x.cost ? x.cost + " credits" : "None"}
---
${x.short_effect || "No Description available"}`,
                    inline: true
                })),
                footer: {
                    text: `[Page ${page + 1} of ${Math.round(usersInventory.length / 9) || 1}]`
                }
            }]
        })

    }
}
