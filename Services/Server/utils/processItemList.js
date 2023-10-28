import processItem from "./processItem.js";

import { Chance } from "chance";

export default (chosenCrate) => {
    const items = [];

    for (const itemlist of chosenCrate.items) {
        // Giveable Item
        items.push(...itemlist.filter(x => !x.chance).map(x => processItem(x)));

        // Weighted List
        const chanceList = itemlist.filter(x => x.chance > 0);
        if (chanceList.length > 1) {
            items.push(processItem(Chance().weighted(chanceList, chanceList.map(x => x.chance))));
        } else if (chanceList.length) {
            // D100 Chance
            const allowedToPush = processItem(chanceList[0]);
            if (allowedToPush) items.push(allowedToPush);
        }
    }

    return items;
}