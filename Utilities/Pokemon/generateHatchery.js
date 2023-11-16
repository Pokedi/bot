import sharp from "sharp";
import Chance from "chance";
export default async (hatchery = []) => {

    const background = sharp('../pokediAssets/hatchery/background.png');

    const egg = sharp('../pokediAssets/hatchery/egg.png');

    let nests = [];

    if (hatchery.includes(1)) nests.push({
        input: await egg.rotate(Chance().integer({ min: -20, max: 20 }), { background: [0, 0, 0, 0] }).toBuffer(),
        top: 289,
        left: 210
    });

    if (hatchery.includes(2)) nests.push({
        input: await egg.rotate(Chance().integer({ min: -20, max: 20 }), { background: [0, 0, 0, 0] }).toBuffer(),
        top: 289,
        left: 627
    });

    if (hatchery.includes(3)) nests.push({
        input: await egg.rotate(Chance().integer({ min: -20, max: 20 }), { background: [0, 0, 0, 0] }).toBuffer(),
        top: 597,
        left: 210
    });

    if (hatchery.includes(4)) nests.push({
        input: await egg.rotate(Chance().integer({ min: -20, max: 20 }), { background: [0, 0, 0, 0] }).toBuffer(),
        top: 597,
        left: 617
    });

    return await background.composite(nests).png({ quality: 60, compressionLevel: 8 }).toBuffer();

}