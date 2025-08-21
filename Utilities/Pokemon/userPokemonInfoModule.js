import i18n from "i18n";

import Pokedex from "../../Classes/pokedex.js";
import { ENUM_GENDER_EMOJIS, ENUM_POKEMON_FULL_TYPES_ID, ENUM_POKEMON_TYPES } from "../Data/enums.js";
import capitalize from "../Misc/capitalize.js";
import calculateNextLevelEXP from "./calculateNextLevelEXP.js";

function userPokemonInfoModule(obj = new Pokedex(), msg = null, count = 1, color = 16776960) {
    if (!obj) return false;

    const details = obj.pokedex;

    const msgObj = {
        title: `#${details.dexid || details.id} - ${capitalize(obj.name || obj.pokemon, true)}${obj.shiny ? " ⭐" : ""} ${ENUM_GENDER_EMOJIS[obj.gender || 4]}`,
        color,
        fields: (() => {

            const { hp, atk, def, spatk, spdef, spd } = obj.calculatedStats()

            let field_array = [{
                name: i18n.__("default.Level"),
                value: (obj.level || 1) + ` [${obj.exp}/${calculateNextLevelEXP(obj.level, details.base_experience)} EXP]`,
                inline: false
            }, {
                name: i18n.__("default.Stats"),
                inline: false,
                value: details._id == "egg" ? i18n.__('default.egg.text') :
                    `**HP:** ${hp} - **IV**: ${obj.stats.hp}/31
**${i18n.__('default.Attack')}:** ${atk} - **IV**: ${obj.stats.atk}/31
**${i18n.__('default.Defense')}:** ${def} - **IV**: ${obj.stats.def}/31
**${i18n.__('default.Sp. Attack')}:** ${spatk} - **IV**: ${obj.stats.spatk}/31
**${i18n.__('default.Sp. Defense')}:** ${spdef} - **IV**: ${obj.stats.spdef}/31
**${i18n.__('default.Speed')}:** ${spd} - **IV**: ${obj.stats.spd}/31
**${i18n.__('default.Total IV')}**: ${obj.calculateTotalIV()}%`
            }, {
                name: i18n.__("default.Natures"),
                value: capitalize(obj.nature),
                inline: true
            }, {
                name: i18n.__("default.Type(s)"),
                value: obj.types.map(x => capitalize(ENUM_POKEMON_FULL_TYPES_ID[x])).join(" | "),
                inline: true
            }, {
                name: i18n.__("default.Held Item"),
                value: capitalize(obj.item || i18n.__("default.Nothing")),
                inline: true
            }];

            // In Case of Market
            if (obj.price) field_array.unshift({
                name: i18n.__("default.Market ID"),
                value: "`" + obj.id + "`\n**Price**\n" + obj.price + " 💸",
                inline: true
            });

            return field_array;
        })(),
        image: {
            url: `attachment://${obj.pokemon}.png`
        },
        footer: {
            text: `${obj.price ? "" : `Pokédi: ${obj.idx || 1}/${count}`}${details.art ? i18n.__('default.art_drawn', { art: details.art }) : ""}`
        },
        author: {
            icon_url: "https://cdn.discordapp.com/attachments/738221731897933844/786154409498378270/Cutie.png",
            name: `Professor Kukui`
        }
    }

    return msgObj;
}

export default userPokemonInfoModule;