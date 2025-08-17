import { Chance } from "chance";
import capitalize from "../Misc/capitalize.js";
import { ENUM_POKEMON_FULL_TYPES_ID } from "../Data/enums.js";

function dexPokemonInfoModule(details = null, color = 16776960) {
    if (!details) return false;
    const msgObj = {
        title: `#${details.dexid || details.id} - ${capitalize(details.name.replace(/-/gmi, ' '), true)}${details.shiny ? " ⭐" : ""}`,
        color,
        description: (() => {

            let finalText = '';

            if (details?.description) finalText += details.description.replace(/\n/gmi, ' ') + "\n-----------\n";

            let levelEvolution = details.evolution_chain.length ? (details.evolution_chain.filter(x => x.pokemon_id < 10000 && (x.trigger == "level-up" || !x.trigger) && !x.time_of_day && !x.min_happiness && !x.min_affection).sort((x, y) => x.pokemon_id - y.pokemon_id)).map(x => {
                const obj = ({ name: x.name, level: x.min_level });

                if (!obj.level)
                    return `Starts off as a ${capitalize(obj.name)}`;

                return `Evolves into ${capitalize(obj.name)} at level ${obj.level}`;
            }).splice(0, 3).join(" → ") : ''

            if (levelEvolution) finalText += "**Evolution:**\n" + levelEvolution + "\n\n";

            return finalText || "-- ╰(*°▽°*)╯ --";
        })(),
        fields: (() => {

            const { hp, atk, def, spatk, spdef, spd } = details;

            let field_array = [{
                name: "Base Stats",
                value: `-----------
**HP:** ${hp}
**Attack:** ${atk}
**Defense:** ${def}
**Sp. Attack:** ${spatk}
**Sp. Defense:** ${spdef}
**Speed:** ${spd}
-----------
**Gender Rate**:
${details.gender_rate == -1 ? "Genderless" : (details.gender_rate != null ? `- ♀️ ${((details.gender_rate / 8) * 100).toFixed(2)}%
- ♂️ ${(100 - ((details.gender_rate / 8) * 100)).toFixed(2)}%` : "Not Found")}`,
                inline: true
            }, {
                name: "Appearance:",
                value: `-----------
**Height:** ${(details.height).toFixed(2) || "???"}m
**Weight:** ${(details.weight).toFixed(2) || "???"}kg
-----------
**Type(s):**
${details.types.map(x => capitalize(ENUM_POKEMON_FULL_TYPES_ID[x])).join(" | ")}`,
                inline: true
            }, {
                name: "Alt Names:",
                value: "-----------\n" + details.altNames.map(x => `:flag_${x.flagcode}: ${x.name}`).join("\n"),
                inline: true
            }];

            return field_array;
        })(),
        image: {
            url: `attachment://${details._id}.png`
        },
        footer: {
            text: `Pokédi: ${details.dexid || details.id || 1}/${1015}${details.art ? ` Art drawn by ${details.art}` : ""}`
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