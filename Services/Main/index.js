import { ClusterClient, getInfo } from "discord-hybrid-sharding";

import { Collection, Client, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import interactionCreateHandler from "../../Handlers/interactionCreateHandler.js";
import prisma from "../Database/index.js";
import bal from "../../Modules/Commands/bal.js";

const client = new Client({
    shards: getInfo().SHARD_LIST, // An array of shards that will get spawned
    shardCount: getInfo().TOTAL_SHARDS, // Total number of shards
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions]
});

client.cluster = new ClusterClient(client); // initialize the Client, so we access the .broadcastEval()

client.commands = new Collection();

client.on('interactionCreate', interactionCreateHandler);

client.login(process.env.DEVTOKEN);

// REST For Commands
const rest = new REST().setToken(process.env.DEVTOKEN);

// Commands Init
const commands = [];

// Bal Command
commands.push(bal.data.toJSON());
client.commands.set("bal", bal.execute);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(Routes.applicationGuildCommands("745793359955624019", "716293571166208001"), { body: commands })

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();

export { client, prisma };