import crates from "../../../Utilities/Data/crates.json" assert {type: "json"};

import { Chance } from "chance";

import processItemList from "./processItemList.js";

function randomSelectCrate(i) {
    return i ? (crates[i] || crates[0]) : (Chance().weighted(crates, crates.map(x => x.chance)));
}

function generateCrate(i) {
    const chosenCrate = randomSelectCrate(i);
    const {name, description} = chosenCrate;
    return {items: processItemList(chosenCrate), name, description};
}

export { generateCrate, randomSelectCrate };