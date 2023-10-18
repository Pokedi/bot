import Pokedex from "../../Classes/pokedex.js";
import { ENUM_POKEMON_TYPES } from "../Data/enums.js";
import capitalize from "../Misc/capitalize.js";
import calculateNextLevelEXP from "./calculateNextLevelEXP.js";

function userPokemonInfoModule(obj = new Pokedex(), msg = null, count = 1) {
    if (!obj) return false;

    const details = obj.pokedex;

    const msgObj = {
        title: `#${details.id} - ${capitalize(obj.name || obj.pokemon, true)}${obj.shiny ? " ⭐" : ""}`,
        color: 16776960,
        fields: (() => {

            const { hp, atk, def, spatk, spdef, spd } = obj.calculatedStats()

            let field_array = [{
                name: "Level",
                value: (obj.level || 1) + ` [${obj.exp}/${calculateNextLevelEXP(obj.level, details.base_experience)} EXP]`,
                inline: false
            }, {
                name: "Stats",
                inline: false,
                value: details._id == "egg" ? "Mysterious Energy dwells within..." :
                    `**HP:** ${hp} - **IV**: ${obj.stats.hp}/31
**Attack:** ${atk} - **IV**: ${obj.stats.atk}/31
**Defense:** ${def} - **IV**: ${obj.stats.def}/31
**Sp. Attack:** ${spatk} - **IV**: ${obj.stats.spatk}/31
**Sp. Defense:** ${spdef} - **IV**: ${obj.stats.spdef}/31
**Speed:** ${spd} - **IV**: ${obj.stats.spd}/31
**Total IV**: ${obj.calculateTotalIV()}%`
            }, {
                name: "Natures",
                value: capitalize(obj.nature),
                inline: true
            }, {
                name: "Type(s)",
                value: obj.types.map(x => capitalize(ENUM_POKEMON_TYPES[x])).join(" | "),
                inline: true
            }, {
                name: "Held Item",
                value: capitalize(obj.item || "Nothing"),
                inline: true
            }];

            // In Case of Market
            if (obj.price) field_array.unshift({
                name: "Market ID",
                value: "`" + obj.id + "`\n**Price**\n" + obj.price + " 💸",
                inline: true
            });

            return field_array;
        })(),
        image: {
            url: `attachment://${details._id}.png`
        },
        footer: {
            text: `${obj.price ? "" : `Pokédi: ${obj.idx || 1}/${count}`}${details.art ? ` Art drawn by ${details.art}` : ""}`
        },
        author: {
            icon_url: "https://cdn.discordapp.com/attachments/738221731897933844/786154409498378270/Cutie.png",
            name: `Professor Kukui`
        }
    }

    return msgObj;
}

export default userPokemonInfoModule;