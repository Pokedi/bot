import { REST, Routes } from "discord.js";

const rest = new REST().setToken(process.env.TOKEN);

export default async (commandList = [
    "catch",
    "bal",
    "eval",
    "info",
    "pick",
    "reload",
    "start",
    "reindex",
    "pokemon",
    "nickname",
    "dex",
    "release",
    "select",
    "team",
    "forcespawn",
    "order",
    "shop",
    "trade",
    "sql",
    "config",
    "profile",
    "duel",
    "moves",
    "daily",
    "bot",
    "admin",
    "redeem",
    "market",
    "inventory",
    "voucher",
    "help",
    "vote",
    "invite",
    "hatchery",
    "battle"
], client, allowRest = process.argv.includes("--force-api")) => {
    const commands = [];

    for (const commandName of commandList) {
        try {
            const { default: importedCommand } = await import(`../../Modules/Commands/${commandName}.js`);

            commands.push(importedCommand.data.toJSON());

            client.commands.set(commandName, importedCommand.execute);

            if (importedCommand.mention_support)
                client.commands.get(commandName).mention_support = importedCommand.mention_support;

            if (importedCommand.alias) {
                for (const alias of importedCommand.alias) {
                    client.commands.set(alias, importedCommand.execute);
                    if (importedCommand.mention_support)
                        client.commands.get(alias).mention_support = importedCommand.mention_support;
                }
            }

        } catch (error) {
            console.log(error);
        }
    }

    if (allowRest) {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        try {
            const data = await rest.put(
                Routes.applicationCommands(process.env.BOTID),
                { body: commands }
            );

            for (const command of data) {
                client.commands.get(command.name).rest = command;
            }

            console.log("Successfully loaded application (/) commands to cache.");

            console.log(`Successfully reloaded ${data.length} application (/) commands.`);

        } catch (error) {
            console.error(error);
        }
    } else {
        const commandsData = await client.application.commands.fetch();

        if (commandsData && commandsData.size) {
            for (const command of commandsData.values()) {
                client.commands.get(command.name).rest = command;
            }
        }
    }
};

