import sharp from "sharp";
import Pokemon from "../../Classes/pokemon.js";

import background from "../../Utilities/Data/background.json" assert {type: "json"};
import trainer from "../../Utilities/Data/trainer.json" assert {type: "json"};
import Pokedex from "../../Classes/pokedex.js";

async function generateProfile(postgres, user, username = "No Username Found") {

    // Count Users Pokemon
    const countPokemon = await user.countPokemon(postgres);

    // Count all Dexes
    const countDexes = await user.countDex(postgres);

    // Select User's Pokemon
    const selectedPokemon = new Pokedex({ user_id: user.id });

    // Selected or First IDX
    if (user.selected?.[0]) {
        selectedPokemon.id = user.selected[0];
        await selectedPokemon.fetchPokemon(postgres);
    } else {
        selectedPokemon.idx = 1;
        await selectedPokemon.fetchPokemonByIDX(postgres);
    }

    // Return if nothing found
    if (!selectedPokemon.pokemon)
        return false;

    // Grab details;

    // Ready Pokemon Image
    let pokemonImage = sharp(selectedPokemon.shiny ? `../pokedi/pokemon/shiny/${selectedPokemon.pokemon}.png` : `../pokedi/pokemon/regular/${selectedPokemon.pokemon}.png`).png().resize({
        width: 400,
        height: 400,
        fit: "contain"
    });

    // Make Resize Background Transparent (Secret trick to help people out later)
    pokemonImage.options.resizeBackground = [0, 0, 0, 0];

    // Select Background
    let selectedBackground = background[user.background];

    if (!selectedBackground || !selectedBackground?.add) selectedBackground = background["1"];

    // Array Base
    let base = [];

    let backgroundImage = sharp(`../pokedi/card/background/${user.background}.${selectedBackground?.jpg ? "jpg" : "png"}`);

    // if (user.profile.badge) {
    //     if (user.profile.badge["1"])
    //         nani.push({
    //             input: await sharp("./card/badges/1.png").resize({
    //                 width: 100,
    //                 height: 100
    //             }).toBuffer(),
    //             top: 960,
    //             left: 720
    //         });
    //     if (user.profile.badge["2"])
    //         nani.push({
    //             input: await sharp("./card/badges/2.png").resize({
    //                 width: 100,
    //                 height: 100
    //             }).toBuffer(),
    //             top: 960,
    //             left: 830
    //         });
    //     if (user.profile.badge["3"])
    //         nani.push({
    //             input: await sharp("./card/badges/3.png").resize({
    //                 width: 100,
    //                 height: 100
    //             }).toBuffer(),
    //             top: 960,
    //             left: 940
    //         });
    //     if (user.profile.badge["4"])
    //         nani.push({
    //             input: await sharp("./card/badges/4.png").resize({
    //                 width: 100,
    //                 height: 100
    //             }).toBuffer(),
    //             top: 960,
    //             left: 1050
    //         });
    //     if (user.profile.badge["5"])
    //         nani.push({
    //             input: await sharp("./card/badges/5.png").resize({
    //                 width: 100,
    //                 height: 100
    //             }).toBuffer(),
    //             top: 960,
    //             left: 1160
    //         });
    //     if (user.profile.badge["6"])
    //         nani.push({
    //             input: await sharp("./card/badges/6.png").resize({
    //                 width: 100,
    //                 height: 100
    //             }).toBuffer(),
    //             top: 960,
    //             left: 1270
    //         });
    //     if (user.profile.badge["7"])
    //         nani.push({
    //             input: await sharp("./card/badges/7.png").resize({
    //                 width: 100,
    //                 height: 100
    //             }).toBuffer(),
    //             top: 960,
    //             left: 1380
    //         });
    //     if (user.profile.badge["8"])
    //         nani.push({
    //             input: await sharp("./card/badges/8.png").resize({
    //                 width: 100,
    //                 height: 100
    //             }).toBuffer(),
    //             top: 960,
    //             left: 1490
    //         });
    // } else {

    // No Badges Yet
    base.push({
        input: Buffer.from(`<svg height="92" width="492">\n  <text x="0" y="30" font-size="40" ${selectedBackground && selectedBackground.add && selectedBackground.add["6"] ? selectedBackground.add["6"] : ""} font-size-adjust="0.58" ${selectedBackground & selectedBackground.bold ? 'font-weight="bold"' : ""} fill="${selectedBackground && selectedBackground.c ? selectedBackground.c : "black"}">No Gyms Badges Yet</text>\n</svg>`),
        top: 985,
        left: 900
    });
    // }

    // Pokemon Character
    base.push({
        input: `../pokedi/card/trainer/${user.character}.png`,
        top: trainer[user.character] && trainer[user.character].top ? trainer[user.character].top : 150,
        left: trainer[user.character] && trainer[user.character].left ? trainer[user.character].left : 200
    }, {
        input: Buffer.from(`<svg height="100%" width="130%">\n  <text x="0" y="40"  ${selectedBackground && selectedBackground.add && selectedBackground.add["1"] ? selectedBackground.add["1"] : ""} font-size="50" ${selectedBackground & selectedBackground.bold ? 'font-weight="bold"' : ""} fill="${selectedBackground && selectedBackground.c ? selectedBackground.c : "black"}">${username.replace(/[^\x00-\x7F]/g, "").substring(0, 20).replace(/[^\d\w\s]/, "").replace(/<|>/gmi, "-")} [Level ${user.level || "0"}]</text>\n</svg>`),
        top: 290,
        left: 750
    }, {
        input: Buffer.from(`<svg height="92" width="492">\n  <text x="0" y="30" font-size="35" ${selectedBackground && selectedBackground.add && selectedBackground.add["2"] ? selectedBackground.add["2"] : ""} font-size-adjust="0.58" ${selectedBackground & selectedBackground.bold ? 'font-weight="bold"' : ""} fill="${selectedBackground && selectedBackground.c ? selectedBackground.c : "black"}">${user.bal ? user.bal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 100} credits</text>\n</svg>`),
        top: 445,
        left: 750
    }, {
        input: Buffer.from(`<svg height="92" width="492">\n  <text x="0" y="30" font-size="40" ${selectedBackground && selectedBackground.add && selectedBackground.add["3"] ? selectedBackground.add["3"] : ""} font-size-adjust="0.58" ${selectedBackground & selectedBackground.bold ? 'font-weight="bold"' : ""} fill="${selectedBackground && selectedBackground.c ? selectedBackground.c : "black"}">${countPokemon ? countPokemon.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0} Caught</text>\n</svg>`),
        top: 570,
        left: 750
    }, {
        input: Buffer.from(`<svg height="92" width="492">\n  <text x="0" y="30" font-size="35" ${selectedBackground && selectedBackground.add && selectedBackground.add["4"] ? selectedBackground.add["4"] : ""} font-size-adjust="0.58" ${selectedBackground & selectedBackground.bold ? 'font-weight="bold"' : ""} fill="${selectedBackground && selectedBackground.c ? selectedBackground.c : "black"}">${countDexes ? countDexes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0} Pokemon Dex'd</text>\n</svg>`),
        top: 705,
        left: 750
    }, {
        input: Buffer.from(`<svg height="92" width="492">\n  <text x="0" y="30" font-size="40" ${selectedBackground && selectedBackground.add && selectedBackground.add["5"] ? selectedBackground.add["5"] : ""} font-size-adjust="0.58" ${selectedBackground & selectedBackground.bold ? 'font-weight="bold"' : ""} fill="${selectedBackground && selectedBackground.c ? selectedBackground.c : "black"}">Solo Player</text>\n</svg>`),
        top: 845,
        left: 750
    }, {
        input: await pokemonImage.toBuffer(),
        top: 420,
        left: 1145
    });

    backgroundImage.composite(base);
    return await backgroundImage.toBuffer();
}

export default generateProfile;
// n.toFile('./data.png');