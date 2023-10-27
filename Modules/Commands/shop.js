import { SlashCommandBuilder } from "discord.js";
import Player from "../../Classes/player.js";
import Pokemon from "../../Classes/pokemon.js";
import { Chance } from "chance";
import capitalize from "../../Utilities/Misc/capitalize.js";
import Pokedex from "../../Classes/pokedex.js";
import pokemondb from "../Database/pokedb.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName("shop")
        .setNameLocalizations({
            "es-ES": "tienda",
            "pt-BR": "loja"
        })
        .setDescription("The place where dreams can come true, I think")
        .addSubcommandGroup(x => x
            .setName("listing")
            .setDescription("All the available options for this command.")
            .addSubcommand(y => y
                .setName("xp")
                .setDescription("XP Boosters & Rare Candy")
                .addIntegerOption(z => z
                    .setName("buy")
                    .setDescription("Buy a booster or EXP")
                    .addChoices({
                        name: "Rare Candy (50c per candy)",
                        value: 4
                    }, {
                        name: "EXP Boost Type-1 (x20) (100c) (2 hours)",
                        value: 1
                    }, {
                        name: "EXP Boost Type-2 (x40) (500c) (10 minutes)",
                        value: 2
                    }, {
                        name: "EXP Boost Type-3 (x60) (2000c) (5 minutes)",
                        value: 3
                    }).setRequired(true)
                )
                .addIntegerOption(z => z
                    .setName("amount")
                    .setDescription("Amount you wish to buy")
                    .setMinValue(1)
                )
            )
            .addSubcommand(y => y
                .setName("stones")
                .setDescription("Evolution Stones used for evolving your Pokemon")
                .addIntegerOption(z => z
                    .setName("stone")
                    .setDescription("Give a stone to your Pokemon to evolve from")
                    // .addChoices({
                    //     name: "Dawn Stone || 250c",
                    //     value: "dawn"
                    // }, {
                    //     name: "Dusk Stone || 250c",
                    //     value: "dusk"
                    // }, {
                    //     name: "Fire Stone || 250c",
                    //     value: "fire",
                    // }, {
                    //     name: "Ice Stone || 250c",
                    //     value: "ice"
                    // }, {
                    //     name: "Leaf Stone || 250c",
                    //     value: "leaf"
                    // }, {
                    //     name: "Moon Stone || 250c",
                    //     value: "moon"
                    // }, {
                    //     name: "Shiny Stone || 250c",
                    //     value: "oval"
                    // }, {
                    //     name: "Sun Stone || 250c",
                    //     value: "sun"
                    // }, {
                    //     name: "Thunder Stone || 250c",
                    //     value: "thunder"
                    // }, {
                    //     name: "Water Stone || 250c",
                    //     value: "water"
                    // }, {
                    //     name: "Friendship Bracelet || 250c",
                    //     value: "friendship"
                    // })
                    .setAutocomplete(true)
                    .setRequired(true)
                ).addIntegerOption(y => y
                    .setName("id")
                    .setDescription("ID of the pokemon if provided")
                    .setMinValue(1)
                )
            )
            .addSubcommand(y => y
                .setName("nature")
                .setDescription("Turn your shy child into a smile child")
                .addStringOption(z => z
                    .setName("nature")
                    .setDescription("Select the nature you wish to give your Pokemon. 500c each.")
                    .addChoices(
                        {
                            name: 'Hardy',
                            value: 'hardy'
                        },
                        {
                            name: 'Lonely',
                            value: 'lonely'
                        },
                        {
                            name: 'Brave',
                            value: 'brave'
                        },
                        {
                            name: 'Adamant',
                            value: 'adamant'
                        },
                        {
                            name: 'Naughty',
                            value: 'naughty'
                        },
                        {
                            name: 'Bold',
                            value: 'bold'
                        },
                        {
                            name: 'Docile',
                            value: 'docile'
                        },
                        {
                            name: 'Relaxed',
                            value: 'relaxed'
                        },
                        {
                            name: 'Impish',
                            value: 'impish'
                        },
                        {
                            name: 'Lax',
                            value: 'lax'
                        },
                        {
                            name: 'Timid',
                            value: 'timid'
                        },
                        {
                            name: 'Hasty',
                            value: 'hasty'
                        },
                        {
                            name: 'Serious',
                            value: 'serious'
                        },
                        {
                            name: 'Jolly',
                            value: 'jolly'
                        },
                        {
                            name: 'Naive',
                            value: 'naive'
                        },
                        {
                            name: 'Modest',
                            value: 'modest'
                        },
                        {
                            name: 'Mild',
                            value: 'mild'
                        },
                        {
                            name: 'Quiet',
                            value: 'quiet'
                        },
                        {
                            name: 'Bashful',
                            value: 'bashful'
                        },
                        {
                            name: 'Rash',
                            value: 'rash'
                        },
                        {
                            name: 'Calm',
                            value: 'calm'
                        },
                        {
                            name: 'Gentle',
                            value: 'gentle'
                        },
                        {
                            name: 'Sassy',
                            value: 'sassy'
                        },
                        {
                            name: 'Careful',
                            value: 'careful'
                        },
                        {
                            name: 'Quirky',
                            value: 'quirky'
                        }
                    ).setRequired(true)
                ).addIntegerOption(y => y
                    .setName("id")
                    .setDescription("ID of the pokemon if provided")
                    .setMinValue(1)
                )
            )
            .addSubcommand(y => y
                .setName("forms")
                .setDescription("Forms & Mega Evolutions || Items & Plates, ya know?")
                .addIntegerOption(x => x.setName('item-name').setDescription("Name of the Form, Item, or State.").setAutocomplete(true))
                .addIntegerOption(y => y
                    .setName("id")
                    .setDescription("ID of the pokemon if provided")
                    .setMinValue(1)
                )
            )
            .addSubcommand(y => y
                .setName("misc")
                .setDescription("Forms, my tears, and so much more!")
            )
            .addSubcommand(y => y
                .setName("menu")
                .setDescription("Shows you a Menu you might like")
            )
        ),
    async execute(msg) {
        const player = new Player(msg.user);
        await player.fetch(msg.client.postgres);

        if (!player.started) return msg.reply("you have not started your adventure. Please try using /start");

        // Is Dueling?
        if (await player.isInDuel(msg.client.redis))
            return await msg.followUp(`You are currently in a duel right now...`);

        // Is Trading
        if (await player.isTrading(msg.client.redis))
            return await msg.followUp(`You are currently in a trade right now...`);

        const subCommand = msg.options.getSubcommand();

        switch (subCommand) {
            case "xp": {
                const amount = msg.options.getInteger("amount") || 1;
                if (msg.options.getInteger("buy") == 4) {
                    if (player.bal < 200 * (amount)) return msg.reply("You do not have enough money for that.");

                    await player.save(msg.client.postgres, {
                        bal: player.bal - 50 * (amount)
                    });

                    const details = await player.pokemonLevelUp(msg.client.postgres, msg, amount);

                    return msg.reply({ ephemeral: true, content: "Pokemon Leveled up! ✅" + (details.evolvedPokemon ? " Seems like an evolution has taken place as well. Check it out!" : "") });
                }
            }
                break;
            case "nature": {
                if (player.bal < 500) return msg.reply("You need at least 500 pokedits for that!");

                const id = msg.options.getInteger("id");

                if (!id && !player.selected[0]) return msg.reply("No Pokemon selected...");

                let selectedPokemon = new Pokemon(id ? { idx: id, user_id: msg.user.id } : { id: player.selected[0] });

                await selectedPokemon.fetchPokemonByIDX(msg.client.postgres);

                if (!selectedPokemon.pokemon) return msg.reply("Pokemon does not exist...");

                const selectedNature = msg.options.getString("nature");

                selectedPokemon.save(msg.client.postgres, { nature: selectedNature })

                await player.save(msg.client.postgres, {
                    bal: player.bal - 500
                });

                return msg.reply(`Your ${capitalize(selectedPokemon.pokemon)} was given a ${selectedNature} mint. ${Chance().pickone(
                    [
                        "It also ate 500 credits from your wallet.",
                        "It snuck some snack money from you.",
                        "It also kidnapped some moneyz from you.",
                        "You got more broke than you already are.",
                        "For some reason you have less money than before... Why?",
                        "Anthony charged you 500 pokedits for taxes."
                    ]
                )}`);
            }

            case "stones":
            case "forms":
                {
                    const product = msg.options.getInteger("stone") || msg.options.getInteger("item-name");

                    const id = msg.options.getInteger("id");

                    let selectedPokemon = new Pokedex(id ? { idx: id, user_id: msg.user.id } : { id: player.selected[0] });

                    const evolution = await selectedPokemon.fetchEvolutionByID(product);

                    if (!evolution || !evolution._id || !evolution.pre_id)
                        return msg.reply("Evolution not found");

                    const [productData] = await pokemondb`SELECT cost, name FROM pokemon_v2_item WHERE id = ${evolution.itemid} LIMIT 1`;

                    if (!productData)
                        return msg.reply("Product not found.");

                    if (player.bal < productData.cost) return msg.reply(`you need at least ${productData.cost} pokedits for that.`);

                    await selectedPokemon.fetchPokemonByIDX(msg.client.postgres, "id, pokemon, gender");

                    if (!selectedPokemon.pokemon) return msg.reply("Pokemon does not exist...");

                    if (evolution.gender_id != null && evolution.gender_id != selectedPokemon.gender)
                        return msg.reply("Gender Confliction met, cannot proceed.");

                    if (selectedPokemon.pokemon != evolution.pre_id)
                        return msg.reply("Pokemon do not match. Nice try.");

                    await selectedPokemon.save(msg.client.postgres, { pokemon: evolution._id });

                    await player.save(msg.client.postgres, {
                        bal: player.bal - (productData.cost || 0)
                    });

                    return msg.reply(`Your ${capitalize(selectedPokemon.pokemon, true)} was given a ${capitalize(productData.name, true)}. ${Chance().pickone(
                        [
                            "It posed like Sailor Moon and turned into a " + capitalize(evolution._id, true),
                            "Power Rangers Pokemon Fury! Go! I summon you, " + capitalize(evolution._id, true),
                            "Wow, puberty hits harder these days.",
                            "I don't know if it's the meds but something's different about them.",
                            "My sweet child has grown up so fast. Give grandpa a kiss."
                        ]
                    )}`);

                }
            case "menu": {

                return msg.reply("Still under construction");
            }
                break;
        }
    }
}
