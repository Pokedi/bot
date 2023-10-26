import builder from "../../Modules/Database/QueryBuilder/queryGenerator.js";
import sql from "../../Modules/Database/postgres.js";
import { reverseENUM } from "../Data/enums.js";

const ENUM_COMMANDS = {
    "1": "pick",
    "2": "bal",
    "3": "eval",
    "4": "info",
    "5": "catch",
    "6": "reload",
    "7": "start",
    "8": "reindex",
    "9": "pokemon",
    "10": "nickname",
    "11": "dex",
    "12": "release",
    "13": "select",
    "14": "team",
    "15": "forcespawn",
    "16": "order",
    "17": "shop",
    "18": "trade",
    "19": "sql",
    "20": "config",
    "21": "profile",
    "22": "duel",
    "23": "moves",
    "24": "daily",
    "25": "shardstats",
    "26": "redeem",
    "27": "market"
}

export default async (msg, obj = { command: 0 }) => {

    let shortval = "";

    const commandName = msg.commandName;

    if (commandName && ["sql", "eval"].includes(commandName))
        return;

    // Trade
    if (commandName == "trade") {
        if (msg.options.getMember('user')?.user)
            shortval = msg.options.getMember('user').user.id;
    }

    const { text, values } = builder.insert("logs", {
        command: commandName ? reverseENUM(ENUM_COMMANDS, commandName) : obj.command,
        user_id: msg.user.id,
        shortval,
        value: JSON.stringify(msg.options._hoistedOptions || {}),
        subcommand: msg.options._subcommand || null,
        groupcommand: msg.options._group || null
    });

    await sql.unsafe(text, values);

    return true;
}