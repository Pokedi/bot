import { ActionRowBuilder, AttachmentBuilder, AttachmentFlags, ButtonBuilder, ButtonStyle, ComponentType, SlashCommandBuilder } from "discord.js";
import findPokemon from "../../Utilities/Pokemon/findPokemon.js";
import dexPokemonInfoModule from "../../Utilities/Pokemon/dexPokemonInfoModule.js";
import capitalize from "../../Utilities/Misc/capitalize.js";
import filterPokemon from "../../Utilities/Pokemon/filterPokemon.js";
import Pokedex from "../../Classes/pokedex.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .addStringOption(option => option.setName('pokemon').setDescription('Name of the Pokemon you are searching'))
        .addBooleanOption(option => option.setName("progress").setDescription("Check your progress with the Pokedex"))
        .addBooleanOption(option => option.setName("claim").setDescription("Claim your prizes!"))
        .addIntegerOption(option => option.setName("page").setDescription("Select the page of the Progressing Pokedex").setMinValue(1))
        .addBooleanOption(option => option.setName("shiny").setDescription("Set to true if you're looking for the Shiny version"))
        .setName('dex')
        .setDescription('View your Pokemon!'),
    async execute(msg) {
        const pokemonName = msg.options.getString('pokemon');

        if (pokemonName) {

            let selectedPokemon = new Pokedex();

            await selectedPokemon.searchForID(pokemonName);

            // findPokemon(pokemonName, false);

            if (!selectedPokemon) return msg.reply("This pokemon does not exist, for some reason?");

            // Fetch dex Data
            await selectedPokemon.fetchDexData()

            // Check if User wants a Shiny
            selectedPokemon.pokedex.shiny = msg.options.getBoolean("shiny");

            // Pokemon Embed
            const pokemonEmbed = dexPokemonInfoModule(selectedPokemon.pokedex);

            // Components
            const buttonComponent = [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('info-button').setEmoji('ℹ').setStyle(ButtonStyle.Secondary))];

            const file = new AttachmentBuilder(`../pokedi/pokemon/${selectedPokemon.pokedex.shiny ? "shiny" : "regular"}/${selectedPokemon.pokedex.name_id}.png`);

            // Send Embed
            const message = await msg.reply({
                embeds: [pokemonEmbed], fetchReply: true, components: buttonComponent,
                files: [file]
            });

            // Ready Other Embed
            const secondEmbed = {
                title: `#${selectedPokemon.id} - ${(selectedPokemon.pokedex.name)}`,
                fields: [],
                thumbnail: {
                    url: `attachment://${selectedPokemon.pokedex.name_id}.png`
                },
                image: null,
                components: buttonComponent
            };

            // Push Buyable Items
            secondEmbed.fields.push({
                name: "Items", value: (() => {
                    if (!selectedPokemon.pokedex.evolution_chain.length || !selectedPokemon.pokedex.evolution_chain.find(x => x.trigger == "use-item"))
                        return "~ Nothing ~";

                    return selectedPokemon.pokedex.evolution_chain.filter(x => x.trigger == "use-item").map(x => {
                        return `**${(selectedPokemon.pokedex.name)}** + **${capitalize(x.item_name)}** => **${capitalize(x.name)}** ${x.item_price ? "(💵" + (x.item_price) + ")" : ""}`
                    }).join("\n") + "\n To buy the item, just `/shop item:<item name>`";
                }
                )()
            });

            // Push Tradable Evolutions
            secondEmbed.fields.push({
                name: "Trade Evolution",
                value: Object.entries(selectedPokemon?.evolution?.['trade'] || {}).map(x => `**${capitalize(x[0] == "null" ? "No Item Required" : x[0].replace(/-/g, ''))}** + Trade => ${capitalize(x[1])}`).join("\n") || "~ Not Available ~",
                inline: true
            })

            // Push Fusions
            secondEmbed.fields.push({
                name: "Fusion",
                value: (() => {
                    if (!selectedPokemon?.evolution?.fusion)
                        return "~ Nope ~";
                    let c = '';
                    Object.keys(selectedPokemon.evolution.fusion).forEach(q => {
                        Object.entries(selectedPokemon.evolution.fusion[q]).forEach(y => {
                            c += `**${capitalize(q)}**  + **${capitalize(y[0])}** => **${capitalize(y[1].name)}**\n`;
                        }
                        )
                    }
                    );
                    return c;
                }
                )()
            });

            // Push Misc Conditions
            (selectedPokemon?.evolution?.mega && (secondEmbed.fields.push({
                name: "Mega",
                value: capitalize(selectedPokemon.evolution.mega.name),
                inline: true
            })));
            (selectedPokemon?.evolution?.['mega-x'] && (secondEmbed.fields.push({
                name: "Mega X",
                value: capitalize(selectedPokemon.evolution['mega-x'].name),
                inline: true
            })));
            (selectedPokemon?.evolution?.['mega-y'] && (secondEmbed.fields.push({
                name: "Mega Y",
                value: capitalize(selectedPokemon.evolution['mega-y'].name),
                inline: true
            })));
            (selectedPokemon?.evolution?.['primal'] && (secondEmbed.fields.push({
                name: "Primal",
                value: capitalize(selectedPokemon.evolution['primal'].name),
                inline: true
            })));
            (selectedPokemon?.evolution?.['move'] && (secondEmbed.fields.push({
                name: "Move",
                value: Object.entries(selectedPokemon.evolution['move'] || {}).map(x => `**${capitalize(x[0].replace(/-/g, ''))}** + Duels => ${capitalize(x[1])}`).join("\n") || "~ Not Available ~",
            })));
            (selectedPokemon?.evolution?.['time'] && (secondEmbed.fields.push({
                name: "Time",
                value: Object.entries(selectedPokemon.evolution['time'] || {}).map(x => `**${capitalize(x[0])}** + Level Up ${x[1].level ? "to Level " + x[1].level + " " : ""}=> ${capitalize(x[1].name)}`).join("\n") || "~ Not Available ~",
            })));
            (selectedPokemon?.evolution?.['name'] && (secondEmbed.fields.push({
                name: "Channel Name",
                value: Object.entries(selectedPokemon.evolution['name'] || {}).map(x => `Channel with the name "**${capitalize(x[0])}**" + Level Up${x[1].level ? " to " + x[1].level : ""} => ${capitalize(x[1].name)}`).join("\n") || "~ Not Available ~",
            })));


            // await message.react("ℹ️");

            let toggle = 0;

            const collector = message.createMessageComponentCollector({
                componentType: ComponentType.Button,
                // maxEmojis: 10,
                // filter: (reaction, user) => { return user.id === msg.user.id }, 
                time: 30000
            });

            collector.on('collect', (i) => {
                if (i.user.id == msg.user.id) {
                    message.edit({ embeds: [!toggle ? secondEmbed : pokemonEmbed] });
                    toggle = !toggle;
                }

                i.reply({ ephemeral: true, content: "👍" });
            });

            collector.on('end', collected => {
            });

            return;

        }

        const progress = msg.options.getBoolean('progress');

        if (progress) {

            const grabPokemon = filterPokemon(x => !x.legendary || !["nonspawn", "nonspawn-legendary", "nonspawn-mythical", "custom"].includes(x.legendary)).sort((x, y) => {
                return x.id - y.id;
            }
            ).map(x => x);

            const page = (msg.options.getInteger("page") || 1) - 1;

            const selectedPokemon = grabPokemon.splice(page * 20, page + 20);

            const grabPokemonLength = grabPokemon.length;

            if (page * 20 > grabPokemonLength) return msg.reply("Sorry, no pokemon to display in that page");

            const user_dex = await msg.client.postgres`SELECT * FROM dex WHERE pokemon in ${msg.client.postgres(selectedPokemon.map(x => x._id))} AND user_id = ${msg.user.id}` || [{}];

            // if (!user_dex[0]) return msg.reply("You didn't catch anything yet");

            let startingID = 0;
            let userDex = user_dex[0] ? Object.assign(...user_dex.map(x => ({ [x.pokemon]: x }))) : [];

            return await msg.reply({
                embeds: [{
                    title: "Pokedex",
                    description: `You've got ${user_dex.count} pokemon so far, where ${grabPokemonLength - user_dex.count} are unclaimed. Use \`/pokedex claim\` to claim all.`,
                    fields: selectedPokemon.map(pk => {
                        if (!startingID) startingID = pk.id;
                        if (!userDex[pk._id]) userDex[pk._id] = {}
                        return {
                            name: capitalize(pk._id) + " #" + pk.id,
                            inline: true,
                            value: true ? `Caught ${(userDex[pk._id].count || 0) > 0 ? userDex[pk._id].count + userDex[pk._id].shinies : 0}! ${(userDex[pk._id].unclaimed_normal || userDex[pk._id]?.unclaimed_shinies) ? "💰" : ""}` : "Not caught yet"
                        };
                    }),
                    footer: {
                        text: `Showing ${startingID}-${startingID + 20} of ${grabPokemon.length} Pokémon.`
                    },
                    color: 44678
                }]
            });
        }

        const claim = msg.options.getBoolean('claim');

        if (claim) {
            const unclaimedPokemon = await msg.client.postgres`SELECT unclaimed_normal, unclaimed_shinies FROM dex WHERE user_id = ${msg.user.id} AND (unclaimed_normal > 0 OR unclaimed_shiny > 0)`;

            if (!unclaimedPokemon.length) return msg.reply("No Pokemon available to be claimed");

            let credits = 0;

            for (const i of unclaimedPokemon) {
                if (i.unclaimed_normal > 0) credits += i.unclaimed_normal * 200;
                if (i.unclaimed_shinies > 0) credits += i.unclaimed_shinies * 2000;
            }

            try {
                await msg.client.postgres.begin(sql => [
                    sql`UPDATE dex SET unclaimed_normal = 0, unclaimed_shinies = 0 WHERE user_id = ${msg.user.id} AND (unclaimed_normal > 0 OR unclaimed_shinies > 0)`,
                    sql`UPDATE users SET bal = bal + ${credits} WHERE id = ${msg.user.id}`
                ]);

                return msg.reply(`Congrats! You got ${credits} pokedits for claiming ${unclaimedPokemon.length} Pokemon!`);
            } catch (error) {
                return msg.reply(`An error occurred claiming your pokedits. Contact an admin!`);
            }
        }
    }
}
