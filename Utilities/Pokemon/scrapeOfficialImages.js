import pokeapisql from "./Modules/Database/pokedb.js";
import http from "https";
import { readdirSync } from "fs";
import { createWriteStream } from "fs";

const files = readdirSync("../pokedi/pokemon/regular/").map(x => x.split(".png")[0]);

const data = await pokeapisql`SELECT name, sprites, pokemon_id as id FROM pokemon_v2_pokemonsprites LEFT JOIN pokemon_v2_pokemon as p ON (pokemon_id = p.id)`;

const notFound = (data.filter(x => !(files.find(y => y == x.name))));

function downloadFile(path, url) {
    return new Promise((resolve) => {
        const file = createWriteStream(path);

        const request = http.get(url, function (response) {
            response.pipe(file);

            // after download completed close filestream
            file.on("finish", () => {
                console.log(path, url)
                file.close();
                console.log("Download Completed");
                resolve(true);
            });
        });
    })
}

let errorOccurred = [];
for (const row of notFound) {
    console.log(row.name, "STARTED");
    try {
        const parsedSprites = JSON.parse(row.sprites);
        const link = parsedSprites.other['official-artwork'];
        // Regular
        await downloadFile("../pokedi/pokemon/regular/" + row.name + ".png", "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" + (link['front_default'] ? link['front_default'].split("official-artwork/")[1] : row.id + ".png"));

        // Shiny
        await downloadFile("../pokedi/pokemon/shiny/" + row.name + ".png", "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/" + (link['front_shiny'] ? link['front_shiny'].split("shiny/")[1] : row.id + ".png"));
    } catch (error) {
        console.log(error);
        errorOccurred.push(row.name);
    }
}

console.log("ERRORS", errorOccurred);

process.exit(1);