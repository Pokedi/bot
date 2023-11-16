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

export async function logCustomReport(obj = { subcommand: "", groupcommand: "", command: 0, channel: 0, guild: 0, user_id: 0, value: "{}", shortval: "" }) {

    return await sql`INSERT INTO logs ${sql({
        command: isNaN(parseInt(obj.command)) ? reverseENUM(ENUM_COMMANDS, obj.command, 0) : obj.command,
        user_id: obj.user_id || null,
        shortval: obj.shortval || null,
        value: obj.value || null,
        subcommand: obj.subcommand || null,
        groupcommand: obj.groupcommand || null,
        guild: obj.guild || null,
        channel: obj.channel || null
    })}`;

}