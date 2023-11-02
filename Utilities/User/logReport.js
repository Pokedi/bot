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
    "27": "market",
    "28": "inventory",
    "29": "voucher",
    "30": "help"
}

export default async (msg, obj = { command: 0 }) => {

    let shortval = "";

    const commandName = msg.commandName;

    if (commandName && ["sql", "eval"].includes(commandName))
        return;

    if (commandName)
        switch (commandName) {
            // Trade
            case "trade":
                if (msg.options.getMember('user')?.user)
                    shortval = msg.options.getMember('user').user.id;
                break;
            case "pick":
            case "catch":
                if (msg.options.getString("pokemon"))
                    shortval = msg.options.getString("pokemon");
                break;
            case "nickname":
                if (msg.options.getString('new-name'))
                    shortval = msg.options.getString('new-name');
                break;
        }

    const { text, values } = builder.insert("logs", {
        command: commandName ? reverseENUM(ENUM_COMMANDS, commandName) : obj.command,
        user_id: msg.user.id,
        shortval,
        value: JSON.stringify(msg.options._hoistedOptions || {}),
        subcommand: msg.options._subcommand || null,
        groupcommand: msg.options._group || null,
        guild: msg.guild.id,
        channel: msg.channel.id
    });

    await sql.unsafe(text, values);

    return true;
}