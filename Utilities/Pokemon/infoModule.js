function userPokemonInfoModule(obj = null, details = null, msg = null, count = 1) {
    if (!obj || !details) return false;
    const msgObj = {
        title: `#${obj.idx} - ${obj.name || obj.pokemon}${obj.shiny ? " ⭐" : ""}`,
        color: 16776960,
        fields: (() => {
            let field_array = [];

            if (obj.pokemon)
                field_array.push({
                    name: "Level",
                    value: (obj.level || 1) + ` [${obj.exp}/${calculateNextLevelEXP(obj.level, details.base_exp)} EXP]`,
                    inline: true
                }, {
                    name: loca(guild, "31"),
                    inline: false,
                    value: (pk._id || pk.pokemon) == "egg" ? "Mysterious Energy dwells within..." : `**${loca(guild, "20")}**: ${st_form(pk.s_hp, sk.stat["hp"], pk.level, "hp", pk.nature)} - IV: ${pk.s_hp}/31\n**${loca(guild, "21")}**: ${st_form(pk.s_atk, sk.stat["atk"], pk.level, "atk", pk.nature)} - IV: ${pk.s_atk}/31\n**${loca(guild, "23")}**: ${st_form(pk.s_def, sk.stat["def"], pk.level, "def", pk.nature)} - IV: ${pk.s_def}/31\n**${loca(guild, "22")}**: ${st_form(pk.s_spatk, sk.stat["spatk"], pk.level, "spatk", pk.nature)} - IV: ${pk.s_spatk}/31\n**${loca(guild, "24")}**: ${st_form(pk.s_spdef, sk.stat["spdef"], pk.level, "spdef", pk.nature)} - IV: ${pk.s_spdef}/31\n**${loca(guild, "25")}**: ${st_form(pk.s_spd, sk.stat["spd"], pk.level, "spd", pk.nature)} - IV: ${pk.s_spd}/31\n**${loca(guild, "27")}**: ${(((pk.s_hp + pk.s_atk + pk.s_def + pk.s_spatk + pk.s_spd + pk.s_spdef) / 186) * 100).toFixed(2)}%`
                }, {
                    name: loca(guild, "18"),
                    value: (pk._id || pk.pokemon) == "egg" ? "Unknown" : capper(pk.nature || "???"),
                    inline: true
                }, {
                    name: loca(guild, "17"),
                    value: capper(sk.types.map(x => Object.entries(types).filter(y => y[1] == x)[0][0]).join(" | ")),
                    inline: true
                });

            if (pk._id && !pk.p) {
                field_array.push({
                    name: loca(guild, "183"),
                    value: `**${loca(guild, "20")}**: ${sk.stat["hp"]}\n**${loca(guild, "21")}**: ${sk.stat["atk"]}\n**${loca(guild, "22")}**: ${sk.stat["def"]}\n**${loca(guild, "23")}**: ${sk.stat["spatk"]}\n**${loca(guild, "24")}**: ${sk.stat["spdef"]}\n**${loca(guild, "25")}**: ${sk.stat["spd"]}\n`,
                    inline: true
                }, {
                    name: loca(guild, "184") + ":",
                    value: `${(sk.height / 10).toFixed(2) || "???"}m`,
                    inline: true
                }, {
                    name: loca(guild, "185") + ":",
                    value: `${(sk.weight / 10).toFixed(2) || "???"}kg`,
                    inline: true
                }, {
                    name: loca(guild, "17"),
                    value: capper(sk.types.map(x => Object.entries(types).filter(y => y[1] == x)[0][0]).join(" | ")),
                    inline: true
                }, {
                    name: loca(guild, "186") + ":",
                    value: (sk.abilities || []).reverse().map(x => {
                        return `${!x.hidden ? capper(x.name.replace(/-/gim, " ")) : "_" + loca(guild, "187") + ": " + capper(x.name.replace(/-/gim, " ")) + "_"}`;
                    }
                    ).join("\n") || "No Abilities",
                    inline: true
                });
            }

            if (pk.pokemon)
                field_array.push({
                    name: "Held Item",
                    value: capper(pk.item || "Nothing"),
                    inline: true
                });

            return field_array;
        })(),
        image: {
            url: `https://pokedi.xyz/pokemon/${obj.shiny && details.shiny ? "shiny" : "regular"}/${obj._id.replace(/\s/gmi, "%20")}.png`
        },
        footer: {
            text: `Pokédi: ${obj.idx}/${count}${details.art ? ` Art drawn by ${details.art}` : ""}`
        },
        author: {
            icon_url: "https://cdn.discordapp.com/attachments/738221731897933844/786154409498378270/Cutie.png",
            name: `Professor Kukui`
        }
    }

    return msgObj;
}

export default userPokemonInfoModule;