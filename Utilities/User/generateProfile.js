import sharp from "sharp";
import Pokemon from "../../Classes/pokemon.js";

import background from "../../Utilities/Data/background.json" assert {type: "json"};
import trainer from "../../Utilities/Data/trainer.json" assert {type: "json"};

async function generateProfile(prisma, user) {

    const countPokemon = await user.countPokemon(prisma);
    
    const countDexes = await user.countDex(prisma);

    const selectedPokemon = new Pokemon({ user_id: user.id });
    
    if (user.selected?.[0]) {
        selectedPokemon.id = user.selected[0];
        await selectedPokemon.fetchPokemon(prisma);
    } else {
        selectedPokemon.idx = 1;
        await selectedPokemon.fetchPokemonByIDX(prisma);
    }
    
    if (!selectedPokemon.pokemon)
        console.log("Nothing found"), process.exit(1);
    
    const pokemonDetails = selectedPokemon.getDetails();
    
    let i = sharp(selectedPokemon.shiny && pokemonDetails.shiny ? `../pokedi/pokemon/shiny/${pokemonDetails._id}.png` : `../pokedi/pokemon/regular/${pokemonDetails._id}.png`).png().resize({
        width: 400,
        height: 400,
        fit: "contain"
    })
        , k = background[user.background];
    i.options.resizeBackground = [0, 0, 0, 0];
    let nani = [];
    
    let n = sharp(`../pokedi/card/background/${user.background}.${k.jpg ? "jpg" : "png"}`);
    
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
    nani.push({
        input: Buffer.from(`<svg height="92" width="492">\n  <text x="0" y="30" font-size="40" ${k && k.add && k.add["6"] ? k.add["6"] : ""} font-size-adjust="0.58" ${k & k.bold ? 'font-weight="bold"' : ""} fill="${k && k.c ? k.c : "black"}">No Gyms Badges Yet</text>\n</svg>`),
        top: 985,
        left: 900
    });
    // }
    nani.push({
        input: `../pokedi/card/trainer/${user.character}.png`,
        top: trainer[user.character] && trainer[user.character].top ? trainer[user.character].top : 150,
        left: trainer[user.character] && trainer[user.character].left ? trainer[user.character].left : 200
    }, {
        input: Buffer.from(`<svg height="100%" width="130%">\n  <text x="0" y="40"  ${k && k.add && k.add["1"] ? k.add["1"] : ""} font-size="50" ${k & k.bold ? 'font-weight="bold"' : ""} fill="${k && k.c ? k.c : "black"}">${"Ditto Duck Penguin".replace(/[^\x00-\x7F]/g, "").substring(0, 20).replace(/[^\d\w\s]/, "").replace(/<|>/gmi, "-")} [Level ${user.level || "0"}]</text>\n</svg>`),
        top: 290,
        left: 750
    }, {
        input: Buffer.from(`<svg height="92" width="492">\n  <text x="0" y="30" font-size="35" ${k && k.add && k.add["2"] ? k.add["2"] : ""} font-size-adjust="0.58" ${k & k.bold ? 'font-weight="bold"' : ""} fill="${k && k.c ? k.c : "black"}">${user.bal ? user.bal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 100} credits</text>\n</svg>`),
        top: 445,
        left: 750
    }, {
        input: Buffer.from(`<svg height="92" width="492">\n  <text x="0" y="30" font-size="40" ${k && k.add && k.add["3"] ? k.add["3"] : ""} font-size-adjust="0.58" ${k & k.bold ? 'font-weight="bold"' : ""} fill="${k && k.c ? k.c : "black"}">${countPokemon ? countPokemon.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0} Caught</text>\n</svg>`),
        top: 570,
        left: 750
    }, {
        input: Buffer.from(`<svg height="92" width="492">\n  <text x="0" y="30" font-size="35" ${k && k.add && k.add["4"] ? k.add["4"] : ""} font-size-adjust="0.58" ${k & k.bold ? 'font-weight="bold"' : ""} fill="${k && k.c ? k.c : "black"}">${countDexes ? countDexes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0} Pokemon Dex'd</text>\n</svg>`),
        top: 705,
        left: 750
    }
    , {
        input: Buffer.from(`<svg height="92" width="492">\n  <text x="0" y="30" font-size="40" ${k && k.add && k.add["5"] ? k.add["5"] : ""} font-size-adjust="0.58" ${k & k.bold ? 'font-weight="bold"' : ""} fill="${k && k.c ? k.c : "black"}">Solo Player</text>\n</svg>`),
        top: 845,
        left: 750
    }
    , {
        input: await i.toBuffer(),
        top: 420,
        left: 1145
    });
    n.composite(nani);
    return await n.toBuffer();
}

export default generateProfile;
// n.toFile('./data.png');