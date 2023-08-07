import { Chance } from "chance";
import { ENUM_POKEMON_TYPES } from "../Data/enums.js";
import capitalize from "../Misc/capitalize.js";

function dexPokemonInfoModule(details = null) {
    if (!details) return false;
    const msgObj = {
        title: `#${details.id} - ${capitalize(details?.alt?.english?.[0] || details._id)}${details.shiny ? " ⭐" : ""}`,
        color: 16776960,
        description: (() => {

            let finalText = '';

            let levelEvolution = details.evolution && details.evolution.level ? [...Object.entries(details.evolution.level).map(x => {
                const obj = ({ name: x[1].name, level: x[0] });

                if (obj.level == "0")
                    return `Starts off as a ${capitalize(obj.name)}`;

                return `Evolves into ${capitalize(obj.name)} at level ${obj.level}`;
            })].join(" → ") : ''

            if (levelEvolution) finalText = levelEvolution + "\n\n";

            if (details.alt) finalText += [...Object.entries(details.alt).map(x => {
                let obj = ({ language: x[0], names: x[1] });

                return (() => {
                    switch (obj.language) {
                        case "english":
                            return ":flag_us:";
                        case "german":
                            return ":flag_de:";
                        case "japanese":
                            return ":flag_jp:";
                        case "chinese":
                            return ":flag_cn:";
                        case "french":
                            return ":flag_fr:";
                        case "korean":
                            return ":flag_kr:";
                    }
                })() + obj.names.map(x => capitalize(x)).join("/")
            })].join("\n");

            return finalText || "-- ╰(*°▽°*)╯ --";
        })(),
        fields: (() => {

            const { hp, atk, def, spatk, spdef, spd } = details.stat

            let field_array = [{
                name: "Base Stats",
                value: `**HP:** ${hp}
**Attack:** ${atk}
**Defense:** ${def}
**Sp. Attack:** ${spatk}
**Sp. Defense:** ${spdef}
**Speed:** ${spd}`,
                inline: true
            }, {
                name: "Height:",
                value: `${(details.height / 10).toFixed(2) || "???"}m`,
                inline: true
            }, {
                name: "Weight:",
                value: `${(details.weight / 10).toFixed(2) || "???"}kg`,
                inline: true
            }, {
                name: "Type(s)",
                value: details.types.map(x => capitalize(ENUM_POKEMON_TYPES[x])).join(" | "),
                inline: true
            }, {
                name: "Abilities:",
                value: (details.abilities || []).reverse().map(x => !x.hidden ? capitalize(x.name.replace(/-/gim, " ")) : "_Hidden: " + capitalize(x.name.replace(/-/gim, " ")) + "_").join("\n") || "No Abilities",
                inline: true
            }];

            return field_array;
        })(),
        image: {
            url: `https://pokedi.xyz/pokemon/${details.shiny ? "shiny" : "regular"}/${details._id.replace(/\s/gmi, "%20")}.png`
        },
        footer: {
            text: `Pokédi: ${details.id || 1}/${1015}${details.art ? ` Art drawn by ${details.art}` : ""}`
        },
        author: Chance().pickone([{
            icon_url: "https://cdn.discordapp.com/attachments/716304762395426816/1136766675895734363/Juniper_Xtransceiver_2.png", name: `Professor Juniper`
        }, {
            icon_url: "https://cdn.discordapp.com/attachments/716304762395426816/1136940197590863903/950px-Omega_Ruby_Alpha_Sapphire_Professor_Birch.png",
            name: "Professor Birch"
        }, {
            icon_url: "https://cdn.discordapp.com/attachments/716304762395426816/1136940197867696158/447px-HeartGold_SoulSilver_Professor_Elm.png",
            name: "Professor Elm"
        }, {
            icon_url: "https://cdn.discordapp.com/attachments/716304762395426816/1136940198178070618/402px-Legends_Arceus_Professor_Laventon.png",
            name: "Professor Laventon"
        }
        ])
    }

    return msgObj;
}

export default dexPokemonInfoModule;