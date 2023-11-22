import sharp from "sharp";
import color from "color";
import { existsSync, readdirSync } from "fs";

// All Pokemon in List
import MiniSearch from "minisearch";
import capitalize from "../Misc/capitalize.js";

// This was done to avoid future chaos
const possiblePokemon = new MiniSearch({ fields: ["id"] });

// Add all Pokemon
possiblePokemon.addAll(readdirSync(`../pokediAssets/duel/sprites/back/`).map(x => ({ id: x })));

// Front + Back
async function readySinglePokemonFrontBack(pokemon, isShiny, isGiga) {

    // Check Existence
    const doesExistBack = existsSync(`../pokediAssets/duel/sprites/back${pokemon.shiny && isShiny ? "-shiny" : ""}/${pokemon._id}.png`);
    const doesExistFront = existsSync(`../pokediAssets/duel/sprites/back${pokemon.shiny && isShiny ? "-shiny" : ""}/${pokemon._id}.png`);

    const [foundPokemon] = possiblePokemon.search(pokemon._id);

    let back = await generateSinglePokemonBox(`../pokediAssets/duel/sprites/back${doesExistBack && pokemon.shiny && isShiny ? "-shiny" : ""}/${doesExistBack ? pokemon._id + ".png" : (foundPokemon?.id || 'unown-qm.png')}`, "southwest");
    let front = await generateSinglePokemonBox(`../pokediAssets/duel/sprites/front${doesExistFront && pokemon.shiny && isShiny ? "-shiny" : ""}/${doesExistFront ? pokemon._id + ".png" : (foundPokemon?.id || 'unown-qm.png')}`);

    return { back, front };
}

async function normalOrGiga(image, isGiga, frontOrBack) {

    // Return Image
    if (!isGiga) return image;

    // Return Giga Front
    if (frontOrBack == "front") return image.clone().composite([{
        input: await image.clone().tint(color('#FF1493')).convolve({
            width: 3,
            height: 3,
            kernel: [-1, 0, 1, -2, 0, 2, -1, 0, 1]
        }).blur(2).toBuffer(),
        top: 0,
        left: 0
    }]);

    // Return Giga Back
    return image.clone().composite([{
        input: await image.clone().tint(color('#FF1493')).convolve({
            width: 3,
            height: 3,
            kernel: [-1, 0, 1, -2, 0, 2, -1, 0, 1]
        }).blur(2).toBuffer(),
        top: 0,
        left: 0
    }]);
}

// Step 1 - Ready Front + Back
async function generateSinglePokemonBox(image_url, gravity) {
    // Ready Image
    let input = (sharp(await sharp(image_url).png().toBuffer()).trim().sharpen({ sigma: 1, m1: 2, m2: 2 }));

    // Get Meta Data of Image
    let info = await input.metadata();

    // Resize input to image data
    input.resize({
        fit: 'contain',
        height: info.height,
        width: info.width,
    });

    // Remove resize Background
    input.options.resizeBackground = [0, 0, 0, 0];

    // A bit of Canvas here and there might help
    let canvas = sharp({
        // Empty box
        create: {
            width: info.width,
            height: info.height,
            background: 'transparent',
            channels: 4
        }
    }).png().composite([{
        // Clone + Tint 
        input: await input.clone().tint(color('#000000')).modulate({
            brightness: 0

            // Add affinity
        }).affine([[1, 0], [0.1, 0.1]], {

            // Background Transparent
            background: 'transparent'
        }).toBuffer(),

        // From the top of the pokemon image height
        top: info.height,
        left: 0
    }, {

        // Add Pokemon
        input: await input.toBuffer(),
        top: 0,
        left: 0
    }]);

    // Adding all into one specified 100 box
    return sharp(await sharp({
        create: {
            width: 100,
            height: 100,
            background: 'transparent',
            channels: 4
        }

        // Compositing everything together
    }).png().composite([{
        input: await canvas.toBuffer(),

        // Gravity to the bottom by default otherwise
        gravity: gravity || 'south'
    }]).toBuffer()).resize({

        // Resizing to 200
        width: 200
    });
}

// Step ready Pokemon Battle Boxes to places
function generateBattleBox(A, B) {
    return Object.values(A).map(async (x, i, y) => {

        let top = 322
            , left = 35;

        switch (y.length) {
            case 3:
                switch (i) {
                    case 0:
                        top = 213,
                            left = 4
                        break;
                    case 1:
                        top = 236,
                            left = 61
                        break;
                    case 2:
                        top = 278,
                            left = 97
                        break;
                }
                break;
            case 2:
                switch (i) {
                    case 0:
                        top = 224,
                            left = 9
                        break;
                    case 1:
                        top = 269,
                            left = 89
                        break;
                }
                break;
            case 1:
                top = 251,
                    left = 35
                break;
        }

        return {
            input: await (await normalOrGiga(x.pokemon[x.battle.selected].battle.img.back, x.pokemon[x.battle.selected].battle.giga, "back")).toBuffer(),
            top,
            left
        };

    }
    ).concat(Object.values(B).map(async (x, i, y) => {
        let top = 166
            , left = 531;
        switch (y.length) {
            case 3:
                switch (i) {
                    case 0:
                        top = 51,
                            left = 300
                        break;
                    case 1:
                        top = 80,
                            left = 407
                        break;
                    case 2:
                        top = 91,
                            left = 542
                        break;
                }
                break;
            case 2:
                switch (i) {
                    case 0:
                        top = 51,
                            left = 300
                        break;
                    case 1:
                        top = 91,
                            left = 542
                        break;
                }
                break;
            case 1:
                top = 56,
                    left = 442
                break;
        }

        return {
            input: await (await normalOrGiga(x.pokemon[x.battle.selected].battle.img.front, x.pokemon[x.battle.selected].battle.giga, "front")).toBuffer(),
            top,
            left
        };
    }
    ))
}

async function returnBattleBox(readiedPokemonCompositions, background = '../pokediAssets/duel/backgrounds/default.png') {
    const battleBox = sharp(background).composite(await Promise.all(readiedPokemonCompositions));
    return await battleBox.toBuffer();
}

function battleBoxFields(teamA = {}, teamB = {}) {
    const formatPokemonData = (team) => {
        return Object.values(team).map(x => {
            const selectedPokemon = x.pokemon[x.battle.selected];
            return `- **${x.globalName}**
> **${capitalize(selectedPokemon.pokemon)}**: ${selectedPokemon.battle.current_hp} / ${selectedPokemon.battle.max_hp} ${(selectedPokemon.battle.status.par) ? '<:paralysis:740214778097696870> ' : ''}${selectedPokemon.battle.status.frz ? '<:frozen:740215495629733889> ' : ""}${selectedPokemon.battle.status.brn ? "<:burn:740258098752520322> " : ''}${selectedPokemon.battle.status.psn ? "<:poison:740292687630172240> " : ''}${selectedPokemon.battle.status.slp ? "<:sleep:742282057346187285> " : ''}`;
        }).join("\n");
    };

    return [
        {
            name: ":crossed_swords: Team A :crossed_swords:",
            value: formatPokemonData(teamA),
            inline: true
        },
        {
            name: ":crossed_swords: Team B :crossed_swords:",
            value: formatPokemonData(teamB),
            inline: true
        }
    ];
}

async function returnEmbedBox(teamA = {}, teamB = {}) {
    return {
        fetchReply: true,
        files: [{
            attachment: await returnBattleBox(generateBattleBox(teamA, teamB)),
            name: "battle.png"
        }],
        embeds: [{
            image: {
                url: "attachment://battle.png"
            },
            fields: battleBoxFields(teamA, teamB),
            author: {
                icon_url: "https://cdn.discordapp.com/attachments/716304762395426816/1154365538303217774/225px-Sun_Moon_Professor_Kukui.png",
                name: "Professor Kukui"
            }
        }]
    }
}

function returnNewFieldEmbed(embed = {}, extraNotes = [], teamA = {}, teamB = {}) {

    embed.embeds[0].fields = battleBoxFields(teamA, teamB);

    embed.embeds[0].fields.push({
        name: "----",
        value: extraNotes.map((x, i) => {
            return (i + 1) + ") " + x;
        }
        ).join("\n") || "Yeah, they hit each other lots."
    });

    return embed;
}

export { readySinglePokemonFrontBack, generateSinglePokemonBox, generateBattleBox, returnBattleBox, battleBoxFields, returnEmbedBox, returnNewFieldEmbed };
