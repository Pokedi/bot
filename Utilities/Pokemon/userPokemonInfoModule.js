import capitalize from "../Misc/capitalize.js";
import calculateNextLevelEXP from "./calculateNextLevelEXP.js";

function userPokemonInfoModule(obj = null, details = null, msg = null, count = 1) {
    if (!obj || !details) return false;
    const msgObj = {
        title: `#${details.id} - ${capitalize(obj.name || obj.pokemon)}${obj.shiny ? " ⭐" : ""}`,
        color: 16776960,
        fields: (() => {

            const { hp, atk, def, spatk, spdef, spd } = obj.calculatedStats()

            let field_array = [{
                name: "Level",
                value: (obj.level || 1) + ` [${obj.exp}/${calculateNextLevelEXP(obj.level, details.base_exp)} EXP]`,
                inline: true
            }, {
                name: "Stats",
                inline: false,
                value: details._id == "egg" ? "Mysterious Energy dwells within..." :
                    `**HP:** ${hp} - **IV**: ${obj.stats.hp}/31
**Attack:** ${atk} - **IV**: ${obj.stats.atk}/31
**Defense:** ${def} - **IV**: ${obj.stats.def}/31
**Sp. Attack:** ${spatk} - **IV**: ${obj.stats.spatk}/31
**Sp. Defense:** ${spdef} - **IV**: ${obj.stats.spdef}/31
**Speed:** ${spd} - **IV**: ${obj.stats.spd}/31`
            }, {
                name: "Natures",
                value: capitalize(obj.nature),
                inline: true
            }, {
                name: "Type(s)",
                value: obj.type.map(x => capitalize(x)).join(" | "),
                inline: true
            }, {
                name: "Held Item",
                value: capitalize(obj.item || "Nothing"),
                inline: true
            }];

            return field_array;
        })(),
        image: {
            url: `https://pokedi.xyz/pokemon/${obj.shiny && details.shiny ? "shiny" : "regular"}/${details._id.replace(/\s/gmi, "%20")}.png`
        },
        footer: {
            text: `Pokédi: ${obj.idx || 1}/${count}${details.art ? ` Art drawn by ${details.art}` : ""}`
        },
        author: {
            icon_url: "https://cdn.discordapp.com/attachments/738221731897933844/786154409498378270/Cutie.png",
            name: `Professor Kukui`
        }
    }

    return msgObj;
}

export default userPokemonInfoModule;