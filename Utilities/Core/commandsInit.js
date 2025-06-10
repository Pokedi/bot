import { REST, Routes } from "discord.js";

// REST For Commands
const rest = new REST().setToken(process.env.TOKEN);

// Commands Init
const commands = [];

// Ready Commands
export default (async (commandList = ["catch", "bal", "eval", "info", "pick", "reload", "start", "reindex", "pokemon", "nickname", "dex", "release", "select", "team", "forcespawn", "order", "shop", "trade", "sql", "config", "profile", "duel", "moves", "daily", "shardstats", "redeem", "market", "inventory", "voucher", "help", "vote", "invite", "hatchery"], client, allowRest = process.argv.includes("--force-api") || false) => {

    // Clear just in-case of reuse
    commands.splice(0, commands.length);

    // Clear Collection just in-case of reuse
    client.commands.clear();

    for (const commandName of commandList) {
        try {
            const { default: importedCommand } = await import("../../Modules/Commands/" + commandName + ".js?update=" + Date.now());
            commands.push(importedCommand.data.toJSON());
            client.commands.set(commandName, importedCommand.execute);

            // Check if it has Aliases => Push to CommandsList + Set in Client Commands => Loop
            if (importedCommand.alias) {
                for (const alias of importedCommand.alias) {
                    commands.push(alias);
                    client.commands.set(alias, importedCommand.execute);
                    if (importedCommand.mention_support)
                        client.commands.get(alias).mention_support = importedCommand.mention_support;
                }
            }

        } catch (error) {
            console.log(error);
        }
    }

    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        let data = [];

        if (allowRest)
            console.log("> Pokedi: API Commands being Reloaded...");

        if (process.env.DEV) {
            // The put method is used to fully refresh all commands in the guild with the current set
            data = allowRest ? await rest.put(Routes.applicationGuildCommands(process.env.BOTID, "716293571166208001"), { body: commands }) : [];
            console.log("Loaded DEV Mode");
        } else {
            if (allowRest)
                data = await rest.put(
                    Routes.applicationCommands(process.env.BOTID),
                    { body: commands }
                );
        }

        if (!allowRest) {
            const commandsData = await client.application.commands.fetch();

            if (commandsData && commandsData.size)
                data = commandsData.values();
        }

        // Configure Rest Command IDs
        for (const command of data) {
            client.commands.get(command.name).rest = command;
        }

        // Output
        console.log("Successfully loaded application (/) commands to cache.");

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);

    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }

});
