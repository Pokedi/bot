// Ready Sharding Library
import { ClusterClient, getInfo } from "discord-hybrid-sharding";

// Ready Client + Collection
import { Collection, Client, Events, GatewayIntentBits, REST, Routes, ActivityType } from "discord.js";

// Init Client
const client = new Client({
    shards: getInfo().SHARD_LIST, // An array of shards that will get spawned
    shardCount: getInfo().TOTAL_SHARDS, // Total number of shards
    intents: process.env.DEV ?
        [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages]
        : [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.cluster = new ClusterClient(client); // initialize the Client, so we access the .broadcastEval()

client.commands = new Collection();

import sql from "../../Modules/Database/postgres.js";
client.postgres = sql;

import interactionCreateHandler from "../../Handlers/interactionCreateHandler.js";
client.on('interactionCreate', interactionCreateHandler);

import messageCreate from "../../Handlers/messageCreate.js";
client.on("messageCreate", messageCreate);

import guildCreate from "../../Handlers/guildCreate.js"
client.on("guildCreate", guildCreate);

import guildDelete from "../../Handlers/guildDelete.js"
client.on("guildDelete", guildDelete);

// Init + Ready Redis to BotClient
import redisClient from "../../Modules/Database/redis.js";
client.redis = redisClient;

// Ready all Commands
import commandsInit from "../../Utilities/Core/commandsInit.js";

// Prepare for Future-Use
client.commandsInit = commandsInit;

// Shard Controller
client.shardID = 0;

// Chance Library
import { Chance } from "chance";

// Assign ShardID to Client when Ready
client.on("shardReady", async id => {
    // Output
    console.log("#", id, " Shard Ready");
    // Ready Commands on Shard
    client.commandsInit(undefined, client);
    // Ready ShardID
    client.shardID = id;
    // Start Activity
    client.user.setActivity("the birds wake up. " + `[C${client.cluster.id}S${id}]`, { type: ActivityType.Watching, shardId: id });
    // Set Activity
    setInterval(() => client.user.setActivity(
        Chance().pickone(["Anthony", "Audrey", "Alpha", "Alicia", "Anthony's Playlist", "Audrey's Jam", "Alpha's College Lecture", "Alicia's Swablu Fanfiction", "/help", "/pokemon", "/help because you need it"]) + ` [C${client.cluster.id}S${id}]`
        , { type: ActivityType.Listening, shardId: id }
    ), 60000 * 10);
});

// Error Handler
client.on("error", (error) => console.log(error));

client.login(process.env.TOKEN);

// Graceful Exit
process.on("SIGINT", () => {
    console.log(`[${new Date().toLocaleString()}][WATCHDOG] Process was exited!`)
    client.destroy();
    process.exit();
});

// unCaught Exception handler
process.on("uncaughtException", (e) => {
    console.log(e);
});

export { client };
