import { REST, Routes } from "discord.js";

// REST For Commands
const rest = new REST().setToken(process.env.DEVTOKEN);

// Commands Init
const commands = [];

// Ready Commands
export default (async (commandList = ["catch", "bal", "eval", "info", "pick", "reload", "start", "reindex", "pokemon", "nickname", "dex", "release", "select", "team", "forcespawn", "order"], client) => {

    // Clear just in-case of reuse
    commands.splice(0, commands.length);

    // Clear Collection just in-case of reuse
    client.commands.clear();

    for (const commandName of commandList) {
        try {
            const { default: importedCommand } = await import("../../Modules/Commands/" + commandName + ".js?q=" + Date.now());
            commands.push(importedCommand.data.toJSON());
            client.commands.set(commandName, importedCommand.execute);
        } catch (error) {
            console.log(error);
        }
    }

    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(Routes.applicationGuildCommands(process.env.DEVID, "716293571166208001"), { body: commands })

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }

});