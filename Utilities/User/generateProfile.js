import sharp from "sharp";
import backgrounds from "../../Utilities/Data/backgrounds.json" assert {type: "json"};
import trainers from "../../Utilities/Data/trainers.json" assert {type: "json"};
import Pokedex from "../../Classes/pokedex.js";
import { existsSync } from "fs";

async function generateProfile(postgres, user = { level: 1, bal: 0, selected: [] }, username = "No Username Found") {

    // Count Users Pokemon
    const countPokemon = await user.countPokemon(postgres);

    // Count all Dexes
    const countDexes = await user.countDex(postgres);

    // Select User's Pokemon
    const userPokemon = new Pokedex({ user_id: user.id });

    // Selected or First IDX
    if (user.selected[0]) {
        userPokemon.id = user.selected[0];
        await userPokemon.fetchPokemon(postgres, "pokemon, shiny");
    } else {
        userPokemon.idx = 1;
        await userPokemon.fetchPokemonByIDX(postgres, "pokemon, shiny");
    }

    // Return if nothing found
    if (!userPokemon.pokemon)
        userPokemon.pokemon = "unown-qm";

    // Ready Level and Balance
    const { level, bal } = user;

    // Ready Dex Status
    const dex = {
        total: 1015,
        caught: countDexes || 0
    }

    // Ready Caught Pokemon
    const caught = countPokemon;

    // Ready Background - Default For Now
    const selectedBackground = backgrounds[user.background] || {
        bold: "bolder",
        fill: "white",
        title_font_size: 70,
        title_add: '',
        level_font_size: "30",
        caught_fill: "white",
        balance_fill: "white",
        dex_fill: "white"
    }

    // Trainer Data
    const trainer = trainers[user.character || "1"] || {
        top: 150,
        left: 200
    };

    // Check if Background Exists
    const baseCheck = existsSync('../pokediAssets/profile/backgrounds/' + user.background + '.png');

    // Allow what is permitted
    const base = sharp('../pokediAssets/profile/backgrounds/' + (baseCheck ? user.background : "1") + '.png');

    // Check if Trainer Exists
    const trainerCheck = existsSync('../pokediAssets/profile/trainers/' + user.character + '.png');

    // Allow what is permitted
    const trainerImage = sharp('../pokediAssets/profile/trainers/' + (trainerCheck ? user.character : "1") + '.png');

    // Check if Pokemon Exists
    const pokemonCheck = existsSync(`../pokediAssets/pokemon/${userPokemon.shiny ? "shiny" : "regular"}/${userPokemon.pokemon}.png`);

    // Select Pokemon
    const selectedPokemon = sharp(`../pokediAssets/pokemon/${userPokemon.shiny && pokemonCheck ? "shiny" : "regular"}/${userPokemon.pokemon}.png`).resize({ width: 472, height: 526, fit: "contain", background: [0, 0, 0, 0] });

    return await base.composite([{
        input: await trainerImage.toBuffer(),
        top: trainer.top || 150,
        left: trainer.left || 200
    }, {
        input: await selectedPokemon.toBuffer(),
        top: 451,
        left: 1080
    }, {
        input: Buffer.from(`<svg height="150" font-family="Poppins" width="664"><text x="10" y="60" ${selectedBackground.title_add || ""} font-size="${selectedBackground.title_font_size || "50"}" ${selectedBackground & selectedBackground.bold ? 'font-weight="' + (selectedBackground.bold || "bold") + '"' : ""} fill="${selectedBackground.fill || "white"}">${username.replace(/[^\x00-\x7F]/g, "").substring(0, 20).replace(/[^\d\w\s]/, "").replace(/<|>/gmi, "-")}</text>\n</svg>`),
        left: 727,
        top: 280
    }, {
        input: Buffer.from(`<svg height="150" font-family="Poppins SemiBold" width="146"><text x="50%" y="50%" text-anchor="middle" alignment-baseline="middle" ${selectedBackground.level_add || ""} font-size="${selectedBackground.level_font_size || "50"}" ${selectedBackground & selectedBackground.level_bold ? 'font-weight="' + (selectedBackground.level_bold || "bold") + '"' : ""} fill="${selectedBackground.level_fill || "white"}">[ ${level || 1} ]</text>\n</svg>`),
        top: 256,
        left: 1400
    }, {
        input: Buffer.from(`<svg height="148" font-family="Poppins SemiBold" width="316"><text font-size-adjust="0.58" font-size="40" fill="${selectedBackground.caught_fill || "white"}" x="10" y="60">${caught.toLocaleString()}</text></svg>`),
        left: 819,
        top: 416
    }, {
        input: Buffer.from(`<svg height="148" font-family="Poppins SemiBold" width="316"><text font-size-adjust="0.58" font-size="40" fill="${selectedBackground.dex_fill || "white"}" x="10" y="60">${dex.caught.toLocaleString()}/${dex.total.toLocaleString()}</text></svg>`),
        left: 819,
        top: 535
    }, {
        input: Buffer.from(`<svg height="148" font-family="Poppins SemiBold" width="316"><text font-size-adjust="0.58" font-size="40" fill="${selectedBackground.balance_fill || "white"}" x="10" y="60">${bal.toLocaleString()}</text></svg>`),
        left: 819,
        top: 650
    }]).png({ quality: 40, compressionLevel: 8 }).toBuffer();
}

export default generateProfile;
// n.toFile('./data.png');