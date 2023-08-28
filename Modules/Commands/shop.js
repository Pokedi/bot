import { SlashCommandBuilder } from "discord.js";
import Player from "../../Classes/player.js";
import Pokemon from "../../Classes/pokemon.js";
import { Chance } from "chance";
import capitalize from "../../Utilities/Misc/capitalize.js";

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
                .addStringOption(z => z
                    .setName("stone")
                    .setDescription("Give a stone to your Pokemon to evolve from")
                    .addChoices({
                        name: "Dawn Stone || 250c",
                        value: "dawn"
                    }, {
                        name: "Dusk Stone || 250c",
                        value: "dusk"
                    }, {
                        name: "Fire Stone || 250c",
                        value: "fire",
                    }, {
                        name: "Ice Stone || 250c",
                        value: "ice"
                    }, {
                        name: "Leaf Stone || 250c",
                        value: "leaf"
                    }, {
                        name: "Moon Stone || 250c",
                        value: "moon"
                    }, {
                        name: "Shiny Stone || 250c",
                        value: "oval"
                    }, {
                        name: "Sun Stone || 250c",
                        value: "sun"
                    }, {
                        name: "Thunder Stone || 250c",
                        value: "thunder"
                    }, {
                        name: "Water Stone || 250c",
                        value: "water"
                    }, {
                        name: "Friendship Bracelet || 250c",
                        value: "friendship"
                    }).setRequired(true)
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
                .addStringOption(x => x.setName('item-name').setDescription("Name of the Form, Item, or State."))
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
        await player.fetch(msg.client.prisma);

        if (!player.started) return msg.reply("you have not started your adventure. Please try using /start");

        const subCommand = msg.options.getSubcommand();

        switch (subCommand) {
            case "xp": {
                const amount = msg.options.getInteger("amount") || 1;
                if (msg.options.getInteger("buy") == 4) {
                    if (player.bal < 200 * (amount)) return msg.reply("You do not have enough money for that.");

                    await player.save({
                        bal: {
                            decrement: 50 * (amount)
                        }
                    });

                    await player.pokemonLevelUp(msg.client.prisma, msg, amount);

                    return msg.reply({ ephemeral: true, content: "Pokemon Leveled up! ✅" });
                }
            }
                break;
            case "nature": {
                if (player.bal < 500) return msg.reply("You need at least 500 pokedits for that!");

                const id = msg.options.getInteger("id");

                if (!id && !player.selected[0]) return msg.reply("No Pokemon selected...");

                let selectedPokemon = new Pokemon(id ? { idx: id, user_id: msg.user.id } : { id: player.selected[0] });

                await selectedPokemon.fetchPokemonByIDX(msg.client.prisma);

                if (!selectedPokemon.pokemon) return msg.reply("Pokemon does not exist...");

                const selectedNature = msg.options.getString("nature");

                selectedPokemon.save(msg.client.prisma, { nature: selectedNature })

                await player.save(msg.client.prisma, {
                    bal: {
                        decrement: 500
                    }
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
                    const product = msg.options.getString("stone") || msg.options.getString("item-name");

                    const productData = await msg.client.prisma.product.findFirst({ where: { id: product } });

                    if (player.bal < productData.cost) return msg.reply(`you need at least ${productData.cost} pokedits for that.`);

                    const id = msg.options.getInteger("id");

                    let selectedPokemon = new Pokemon(id ? { idx: id, user_id: msg.user.id } : { id: player.selected[0] });

                    await selectedPokemon.fetchPokemonByIDX(msg.client.prisma);

                    if (!selectedPokemon.pokemon) return msg.reply("Pokemon does not exist...");

                    const basePokemon = selectedPokemon.getDetails();

                    const evoPokemon = basePokemon?.evolution?.items?.[product]?.name;

                    if (!evoPokemon) return msg.reply("❎ Yeah that Item doesn't work for this lil guy. Sorry. ❎");

                    await selectedPokemon.save(msg.client.prisma, { pokemon: evoPokemon });

                    await player.save(msg.client.prisma, {
                        bal: {
                            decrement: productData.cost || 0
                        }
                    });

                    return msg.reply(`Your ${capitalize(selectedPokemon.pokemon)} was given a ${productData.name}. ${Chance().pickone(
                        [
                            "It posed like Sailor Moon and turned into a " + capitalize(evoPokemon),
                            "Power Rangers Pokemon Fury! Go! I summon you, " + capitalize(evoPokemon),
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
