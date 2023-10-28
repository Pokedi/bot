import { Chance } from "chance";

export default (item) => {
    if (item && item.chance) {
        return Chance().d100() <= item.chance ? { type: item.type, item_id: item.item_id, name: item.name, amount: item.min ? Chance().integer({ min: item.min, max: item.max }) : item.amount } : false;
    }

    if (item && item.min && item.max)
        return { type: item.type, item_id: item.item_id, name: item.name, amount: Chance().integer({ min: item.min, max: item.max }) };

    return { type: item.type, item_id: item.item_id, name: item.name, amount: item.amount || 1 };
}