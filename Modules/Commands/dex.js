import { ActionRowBuilder, AttachmentBuilder, AttachmentFlags, ButtonBuilder, ButtonStyle, ComponentType, SlashCommandBuilder } from "discord.js";
import findPokemon from "../../Utilities/Pokemon/findPokemon.js";
import dexPokemonInfoModule from "../../Utilities/Pokemon/dexPokemonInfoModule.js";
import capitalize from "../../Utilities/Misc/capitalize.js";
import filterPokemon from "../../Utilities/Pokemon/filterPokemon.js";
import Pokedex from "../../Classes/pokedex.js";
import pokemondb from "../Database/pokedb.js";

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

            if (!selectedPokemon || !selectedPokemon.pokedex.id) return msg.reply("This pokemon does not exist, for some reason?");

            // Fetch dex Data
            await selectedPokemon.fetchDexData();

            // Check if User wants a Shiny
            selectedPokemon.pokedex.shiny = msg.options.getBoolean("shiny");

            // Pokemon Embed
            const pokemonEmbed = dexPokemonInfoModule(selectedPokemon.pokedex);

            // Components
            const buttonComponent = [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('info-button').setEmoji('ℹ').setStyle(ButtonStyle.Secondary))];

            const file = new AttachmentBuilder(`../pokedi/pokemon/${selectedPokemon.pokedex.shiny ? "shiny" : "regular"}/${selectedPokemon.pokedex._id}.png`);

            // Send Embed
            const message = await msg.reply({
                embeds: [pokemonEmbed], fetchReply: true, components: buttonComponent,
                files: [file]
            });

            // Ready Other Embed
            const secondEmbed = {
                title: `#${selectedPokemon.pokedex.id} - ${(selectedPokemon.pokedex.name)}`,
                fields: [],
                thumbnail: {
                    url: `attachment://${selectedPokemon.pokedex._id}.png`
                },
                image: null,
                components: buttonComponent
            };

            if (selectedPokemon.pokedex.evolution_chain.length) {

                if (selectedPokemon.pokedex.evolution_chain.find(x => x.trigger == "use-item" && x.name != selectedPokemon.pokedex._id))
                    // Push Buyable Items
                    secondEmbed.fields.push({
                        name: "🛍️ Items", value: (() => {
                            if (!selectedPokemon.pokedex.evolution_chain.length || !selectedPokemon.pokedex.evolution_chain.find(x => x.trigger == "use-item" && x.name != selectedPokemon.pokedex._id))
                                return "~ Nothing ~";

                            return selectedPokemon.pokedex.evolution_chain.filter(x => x.trigger == "use-item").map(x => {
                                return `**${capitalize(selectedPokemon.pokedex.name, true)}** + **${capitalize(x.item_name)}** => **${capitalize(x.name)}** ${x.item_price ? "(💵" + (x.item_price) + ")" : ""}`
                            }).join("\n") + "\n To buy the item, just `/shop item:<item name>`";
                        }
                        )()
                    });

                // Push Tradable Evolutions
                if (selectedPokemon.pokedex.evolution_chain.find(x => x.trigger == "trade" && x.name != selectedPokemon.pokedex._id))
                    secondEmbed.fields.push({
                        name: "🗃️ Trade Evolution",
                        value: selectedPokemon.pokedex.evolution_chain.filter(x => x.trigger == "trade").map(x => `**${capitalize(!x.item_name ? "No Item Required" : x.item_name.replace(/-/g, ''))}** + Trade => ${capitalize(x.name)}`).join("\n") || "~ Not Available ~",
                        inline: true
                    })
            }

            if (selectedPokemon.pokedex.fusions.length)
                // Push Fusions
                secondEmbed.fields.push({
                    name: "♊ Fusion",
                    value: selectedPokemon.pokedex.fusions.map(x => `**${capitalize(x.first_pokemon)}** + **${capitalize(x.second_pokemon)}** => **${capitalize(x.evolved_pokemon)}**`).join("\n")
                });

            if (selectedPokemon.pokedex.forms.length) {

                const forms = selectedPokemon.pokedex.forms;
                // Push Misc Conditions
                // Mega
                const megaPokemon = forms.find(x => x.name.endsWith("mega"))
                if (megaPokemon) {
                    secondEmbed.fields.push({
                        name: "🔴 Mega",
                        value: capitalize(megaPokemon.name.replace(/-/gmi, ' ')),
                        inline: true
                    });
                };

                // MegaX
                const megaXPokemon = forms.find(x => x.name.endsWith("mega-x"))
                if (megaXPokemon) {
                    secondEmbed.fields.push({
                        name: "🔴 Mega X",
                        value: capitalize(megaXPokemon.name.replace(/-/gmi, ' ')),
                        inline: true
                    });
                };

                // Mega Y
                const megaYPokemon = forms.find(x => x.name.endsWith("mega-y"))
                if (megaYPokemon) {
                    secondEmbed.fields.push({
                        name: "🔴 Mega Y",
                        value: capitalize(megaYPokemon.name.replace(/-/gmi, ' ')),
                        inline: true
                    });
                };

                // Mega Y
                const primalPokemon = forms.find(x => x.name.endsWith("primal"))
                if (primalPokemon) {
                    secondEmbed.fields.push({
                        name: "🟡 Primal",
                        value: capitalize(primalPokemon.name.replace(/-/gmi, ' ')),
                        inline: true
                    });
                };

                const timeEvolution = selectedPokemon.pokedex.evolution_chain.filter(x => x.time_of_day);
                if (timeEvolution.length)
                    secondEmbed.fields.push({
                        name: "🕰️ Time",
                        value: timeEvolution.map(x => `${capitalize(selectedPokemon.pokedex.name)} + ${capitalize(x.time_of_day)} + Level Up${x.min_level ? " to " + x.min_level : ""} => ${capitalize(x.name)}`).join("\n"),
                        inline: true
                    });

                // To-Do: Evolve by Pokemon Name
                // To-Do: Evolve by Channel Name

                const affectionEvolution = selectedPokemon.pokedex.evolution_chain.filter(x => x.min_happiness);
                if (affectionEvolution.length)
                    secondEmbed.fields.push({
                        name: "💖 Affection",
                        value: affectionEvolution.map(x => `${capitalize(selectedPokemon.pokedex.name)} + Love + Level Up${x.min_level ? " to " + x.min_level : ""} => ${capitalize(x.name)}`).join("\n"),
                        inline: false
                    });

                const otherForms = selectedPokemon.pokedex.forms.filter(x => x._id && ![megaXPokemon, megaYPokemon, primalPokemon].concat().filter(x => x).map(y => y._id).includes(x._id))
                if (otherForms.length)
                    secondEmbed.fields.push({
                        name: "🌅 Other Forms",
                        value: otherForms.map(x => `${capitalize(selectedPokemon.pokedex.name)} + ❓ => ${capitalize((x._id).replace(/-/gmi, ' '))}`).join("\n") + "\n- You must find out how to get them to turn into these! Your adventure awaits!",
                        inline: false
                    });
            }

            if (!secondEmbed.fields.length)
                secondEmbed.fields.push({
                    name: "Note",
                    value: "This Pokemon does not seem to have any other evolutionary information available at the moment."
                });

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

            const page = (msg.options.getInteger("page") || 1) - 1;

            const [{ count: grabPokemonLength }] = await pokemondb`SELECT count(true) as count FROM pokemon_v2_pokemonspecies`;

            const selectedPokemon = await pokemondb`SELECT id, name FROM pokemon_v2_pokemonspecies ORDER BY id ASC LIMIT 20 OFFSET ${page * 20}`;

            if (page * 20 > grabPokemonLength) return msg.reply("Sorry, no pokemon to display in that page");

            const user_dex = await msg.client.postgres`SELECT * FROM dex WHERE pokemon in ${msg.client.postgres(selectedPokemon.map(x => x.name))} AND user_id = ${msg.user.id}` || [{}];

            // if (!user_dex[0]) return msg.reply("You didn't catch anything yet");

            let startingID = 0;

            let userDex = user_dex[0] ? Object.assign(...user_dex.map(x => ({ [x.pokemon]: x }))) : [];

            return await msg.reply({
                embeds: [{
                    title: "Pokedex",
                    description: `You've got ${user_dex.count} pokemon so far, where ${grabPokemonLength - user_dex.count} are uncaught. Use \`/pokedex claim\` to claim all rewards.`,
                    fields: selectedPokemon.map(pk => {
                        if (!startingID) startingID = pk.id;
                        if (!userDex[pk.name]) userDex[pk.name] = { count: 0 };
                        return {
                            name: capitalize(pk.name.replace(/-/gmi, ' ')) + " #" + pk.id,
                            inline: true,
                            value: userDex[pk.name].count ? `Caught ${(userDex[pk.name].count || 0) > 0 ? userDex[pk.name].count + userDex[pk.name].shinies : 0}! ${(userDex[pk.name].unclaimed_normal || userDex[pk.name]?.unclaimed_shinies) ? "💰" : ""}` : "Not caught yet"
                        };
                    }),
                    footer: {
                        text: `Showing ${startingID}-${startingID + 20} of ${grabPokemonLength} Pokémon.`
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
