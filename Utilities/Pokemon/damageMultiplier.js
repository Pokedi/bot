/** 
 * Damage Multiplier
 * 
 * @return [multiplier, note]
 */

export default (pokemon_type, some_move, t) => {
    let multiplier = 1;
    let note = "";

    pokemon_type.forEach(p=>{
        switch (some_move.t) {
        case "n":
            if (["r", "s"].includes(p)) {
                multiplier *= 1 / 2;
                note = "! It wasn't very effective!";
            } else if (["gh"].includes(p)) {
                multiplier *= 0;
                note = "! It had no effect.";
            }
            break;
        case "f":
            if (["f", "w", "r", "dr"].includes(p)) {
                multiplier *= 1 / 2;
                note = "! It wasn't very effective!";
            } else if (["g", "i", "b", "s"].includes(p)) {
                multiplier *= 2;
                note = "! It was super effective!";
            }
            break;
        case "w":
            if (["w", "g", "dr"].includes(p)) {
                multiplier *= 1 / 2;
                note = "! It wasn't very effective!";
            } else if (["f", "gr", "r"].includes(p)) {
                multiplier *= 2;
                note = "! It was super effective!";
            }
            break;
        case "e":
            if (["e", "g", "dr"].includes(p)) {
                multiplier *= 1 / 2;
                note = "! It wasn't very effective!";
            } else if (["w", "fl"].includes(p)) {
                multiplier *= 2;
                note = "! It was super effective!";
            } else if (["gr"].includes(p)) {
                multiplier *= 0;
                note = "! It had no effect.";
            }
            break;
        case "g":
            if (["f", "g", "p", "fl", "b", "dr", "s"].includes(p)) {
                multiplier *= 1 / 2;
                note = "! It wasn't very effective!";
            } else if (["w", "gr", "r"].includes(p)) {
                multiplier *= 2;
                note = "! It was super effective!";
            }
            break;
        case "i":
            if (["f", "w", "i", "s"].includes(p)) {
                multiplier *= 1 / 2;
                note = "! It wasn't very effective!";
            } else if (["g", "gr", "fl", "dr"].includes(p)) {
                multiplier *= 2;
                note = "! It was super effective!";
            }
            break;
        case "fi":
            if (["p", "fl", "ps", "b", "fr"].includes(p)) {
                multiplier *= 1 / 2;
                note = "! It wasn't very effective!";
            } else if (["n", "i", "r", "da", "s"].includes(p)) {
                multiplier *= 2;
                note = "! It was super effective!";
            } else if (["gh"].includes(p)) {
                multiplier *= 0;
                note = "! It had no effect.";
            }
            break;
        case "p":
            if (["p", "gr", "r", "gh"].includes(p)) {
                multiplier *= 1 / 2;
                note = "! It wasn't very effective!";
            } else if (["g", "fr"].includes(p)) {
                multiplier *= 2;
                note = "! It was super effective!";
            } else if (["s"].includes(p)) {
                multiplier *= 0;
                note = "! It had no effect.";
            }
            break;
        case "gr":
            if (["g", "b"].includes(p)) {
                multiplier *= 1 / 2;
                note = "! It wasn't very effective!";
            } else if (["f", "e", "p", "r", "s"].includes(p)) {
                multiplier *= 2;
                note = "! It was super effective!";
            } else if (["fl"].includes(p)) {
                multiplier *= 0;
                note = "! It had no effect.";
            }
            break;
        case "fl":
            if (["e", "r", "s"].includes(p)) {
                multiplier *= 1 / 2;
                note = "! It wasn't very effective!";
            } else if (["g", "fi", "b"].includes(p)) {
                multiplier *= 2;
                note = "! It was super effective!";
            }
            break;
        case "ps":
            if (["ps", "s"].includes(p)) {
                multiplier *= 1 / 2;
                note = "! It wasn't very effective!";
            } else if (["fi", "p"].includes(p)) {
                multiplier *= 2;
                note = "! It was super effective!";
            } else if (["da"].includes(p)) {
                multiplier *= 0;
                note = "! It had no effect.";
            }
            break;
        case "b":
            if (["f", "fi", "p", "fl", "r", "s", "fr"].includes(p)) {
                multiplier *= 1 / 2;
                note = "! It wasn't very effective!";
            } else if (["g", "ps", "da"].includes(p)) {
                multiplier *= 2;
                note = "! It was super effective!";
            }
            break;
        case "r":
            if (["fi", "gr", "s"].includes(p)) {
                multiplier *= 1 / 2;
                note = "! It wasn't very effective!";
            } else if (["f", "i", "fl", "b"].includes(p)) {
                multiplier *= 2;
                note = "! It was super effective!";
            }
            break;
        case "gh":
            if (["da"].includes(p)) {
                multiplier *= 1 / 2;
                note = "! It wasn't very effective!";
            } else if (["ps", "gh"].includes(p)) {
                multiplier *= 2;
                note = "! It was super effective!";
            } else if (["n"].includes(p)) {
                multiplier *= 0;
                note = "! It had no effect.";
            }
            break;
        case "dr":
            if (["s"].includes(p)) {
                multiplier *= 1 / 2;
                note = "! It wasn't very effective!";
            } else if (["dr"].includes(p)) {
                multiplier *= 2;
                note = "! It was super effective!";
            } else if (["fr"].includes(p)) {
                multiplier *= 0;
                note = "! It had no effect.";
            }
            break;
        case "da":
            if (["fi", "da", "fr"].includes(p)) {
                multiplier *= 1 / 2;
                note = "! It wasn't very effective!";
            } else if (["ps", "gh"].includes(p)) {
                multiplier *= 2;
                note = "! It was super effective!";
            }
            break;
        case "s":
            if (["f", "w", "e", "s"].includes(p)) {
                multiplier *= 1 / 2;
                note = "! It wasn't very effective!";
            } else if (["i", "r", "fr"].includes(p)) {
                multiplier *= 2;
                note = "! It was super effective!";
            }
            break;
        case "fr":
            if (["f", "p", "s"].includes(p)) {
                multiplier *= 1 / 2;
                note = "! It wasn't very effective!";
            } else if (["fi", "dr", "da"].includes(p)) {
                multiplier *= 2;
                note = "! It was super effective!";
            }
            break;
        }
    }
    );

    if (t.includes(some_move.t))
        multiplier *= 1.5;

    return [multiplier, note];
}