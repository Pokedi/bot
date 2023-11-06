import crates from "../../../Utilities/Data/crates.json" assert {type: "json"};

import { Chance } from "chance";

import processItemList from "./processItemList.js";

function randomSelectCrate(i) {
    return i ? (crates[i] || crates.find(x => x.id == i) || crates[0]) : (Chance().weighted(crates, crates.map(x => x.chance)));
}

function generateCrate(i, crate) {
    const chosenCrate = crate || randomSelectCrate(i);
    const { name, description } = chosenCrate;
    return { items: processItemList(chosenCrate), name, description };
}

export { generateCrate, randomSelectCrate };