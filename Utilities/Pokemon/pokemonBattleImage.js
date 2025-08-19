import sharp from "sharp";
import color from "color";
import { existsSync, readdirSync } from "fs";
import MiniSearch from "minisearch";
import capitalize from "../Misc/capitalize.js";

// This was done to avoid future chaos
const possiblePokemon = new MiniSearch({ fields: ["id"] });

// Add all Pokemon
possiblePokemon.addAll(readdirSync(`../pokediAssets/duel/sprites/back/`).map(x => ({ id: x })));

// Front + Back
async function readySinglePokemonFrontBack(pokemon, isShiny) {
    const pokemonId = pokemon._id.toLowerCase().replace(/[^a-z0-9]+/g, '');
    const [foundPokemon] = possiblePokemon.search(pokemonId);
    const fileName = foundPokemon?.id || 'unown-qm.png';

    const backPath = `../pokediAssets/duel/sprites/back${pokemon.shiny && isShiny ? "-shiny" : ""}/${fileName}`;
    const frontPath = `../pokediAssets/duel/sprites/front${pokemon.shiny && isShiny ? "-shiny" : ""}/${fileName}`;

    let back = await generateSinglePokemonBox(existsSync(backPath) ? backPath : `../pokediAssets/duel/sprites/back/unown-qm.png`, "southwest");
    let front = await generateSinglePokemonBox(existsSync(frontPath) ? frontPath : `../pokediAssets/duel/sprites/front/unown-qm.png`);

    return { back, front };
}

async function normalOrGiga(image, isGiga) {
    if (!isGiga || !image) return image;

    // The giga effect can be applied generically to front or back images.
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

async function generateSinglePokemonBox(image_url, gravity) {
    let input = sharp(image_url).trim().sharpen({ sigma: 1, m1: 2, m2: 2 });
    let info = await input.metadata();

    input.resize({
        fit: 'contain',
        height: info.height,
        width: info.width,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
    });

    let canvas = sharp({
        create: {
            width: info.width,
            height: info.height * 2, // Make canvas taller for shadow
            background: 'transparent',
            channels: 4
        }
    }).png().composite([{
        input: await input.clone().tint('#000000').modulate({
            brightness: 0
        }).affine([[1, 0], [0.1, 0.1]], {
            background: 'transparent'
        }).toBuffer(),
        top: Math.round(info.height * 0.1), // Position shadow slightly below
        left: 0
    }, {
        input: await input.toBuffer(),
        top: 0,
        left: 0
    }]);

    return sharp({
        create: {
            width: 200,
            height: 200,
            background: 'transparent',
            channels: 4
        }
    }).png().composite([{
        input: await canvas.toBuffer(),
        gravity: gravity || 'south'
    }]);
}

// Step 2 - Ready Pokemon Battle Boxes to places
function generateBattleBox(teamA, teamB) {
    // Helper to get active Pokémon for a team (player)
    const getActivePokemonCompositions = (team, isOpponent) => {
        if (!team.battle.request?.side?.pokemon) return [];

        const activePokemons = team.battle.request.side.pokemon.filter(p => p.active);

        return activePokemons.map((activePoke, i) => {
            const nickname = activePoke.ident.split(': ')[1].trim();
            // Find the original pokemon instance to get the pre-rendered image
            const originalPoke = team.pokemon.find(p => (p.name || p.pokemon) === nickname);

            if (!originalPoke) return null;

            const image = isOpponent ? originalPoke.battle.img.front : originalPoke.battle.img.back;
            const isGiga = activePoke.details.includes('-Gmax') || activePoke.gmax;

            // Positioning logic from original duel.js
            let top, left;
            const teamSize = activePokemons.length;

            if (isOpponent) { // Team B (Front view)
                left = 531; top = 166; // Default for 1v1
                if (teamSize === 2) { [top, left] = [[51, 300], [91, 542]][i]; }
                if (teamSize === 3) { [top, left] = [[51, 300], [80, 407], [91, 542]][i]; }
            } else { // Team A (Back view)
                left = 35; top = 322; // Default for 1v1
                if (teamSize === 2) { [top, left] = [[224, 9], [269, 89]][i]; }
                if (teamSize === 3) { [top, left] = [[213, 4], [236, 61], [278, 97]][i]; }
            }

            return {
                input: normalOrGiga(image, isGiga).then(img => img.toBuffer()),
                top,
                left
            };
        }).filter(Boolean); // Filter out nulls if a pokemon wasn't found
    };

    const compositionsA = getActivePokemonCompositions(teamA, false);
    const compositionsB = getActivePokemonCompositions(teamB, true);

    // Promise.all is needed because the inputs are now promises
    return Promise.all([...compositionsA, ...compositionsB].map(async comp => ({ ...comp, input: await comp.input })));
}


async function returnBattleBox(readiedPokemonCompositions, background = '../pokediAssets/duel/backgrounds/default.png') {
    const battleBox = sharp(background).composite(await readiedPokemonCompositions);
    return await battleBox.toBuffer();
}

function battleBoxFields(teamA = {}, teamB = {}) {
    const statusEmojis = {
        'par': '<:paralysis:740214778097696870>',
        'frz': '<:frozen:740215495629733889>',
        'brn': '<:burn:740258098752520322>',
        'psn': '<:poison:740292687630172240>',
        'slp': '<:sleep:742282057346187285>'
    };

    const formatPokemonData = (team) => {
        if (!team.battle.request?.side?.pokemon) return "> Waiting for battle to start...";

        const player = team.battle.request.side.name;
        const pokemons = team.battle.request.side.pokemon;

        const pokemonStrings = pokemons.map(poke => {
            const [hpString, status] = poke.condition.split(' ');
            const name = poke.ident.split(': ')[1].trim();
            const activeMarker = poke.active ? '**' : '';
            const statusEmoji = status ? (statusEmojis[status.toLowerCase()] || `[${status.toUpperCase()}]`) : '';

            return `> ${activeMarker}${capitalize(name)}${activeMarker}: ${hpString} ${statusEmoji}`;
        }).join("\n");

        return `- **${player}**\n${pokemonStrings}`;
    };

    return [
        { name: ":crossed_swords: Team A :crossed_swords:", value: formatPokemonData(teamA), inline: true },
        { name: ":crossed_swords: Team B :crossed_swords:", value: formatPokemonData(teamB), inline: true }
    ];
}

async function returnEmbedBox(teamA = {}, teamB = {}, useOldImage = false, oldFiles = [], noFields = false) {
    const compositions = await generateBattleBox(teamA, teamB);
    return {
        withResponse: true,
        files: useOldImage && oldFiles.length ? oldFiles : [{
            attachment: await returnBattleBox(compositions),
            name: "battle.png"
        }],
        embeds: [{
            image: { url: "attachment://battle.png" },
            fields: noFields ? [] : battleBoxFields(teamA, teamB),
            author: {
                icon_url: "https://cdn.discordapp.com/attachments/716304762395426816/1154365538303217774/225px-Sun_Moon_Professor_Kukui.png",
                name: "Professor Kukui"
            }
        }]
    };
}

async function updateEmbedBox(existingMessage, extraNotes = [], teamA = {}, teamB = {}, forceUpdateImage = false) {
    const newEmbedData = forceUpdateImage ? await returnEmbedBox(teamA, teamB, false) : existingMessage.message.embeds[0].image;

    const embed = newEmbedData.embeds[0];
    if (extraNotes.length > 0) {
        embed.fields.push({
            name: "Battle Log",
            value: extraNotes.filter(Boolean).map((x, i) => `${x}`).join("\n").substring(0, 1024) || "The battle rages on!"
        });
    }

    // Edit the existing message with the new file and embed
    return await existingMessage.channel.send({
        files: newEmbedData.files,
        embeds: [embed]
    });
}

export { readySinglePokemonFrontBack, generateSinglePokemonBox, generateBattleBox, returnBattleBox, battleBoxFields, returnEmbedBox, updateEmbedBox };