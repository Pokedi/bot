import builder from "../../Modules/Database/QueryBuilder/queryGenerator.js";
import sql from "../../Modules/Database/postgres.js";
import { reverseENUM, ENUM_COMMANDS } from "../Data/enums.js";

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