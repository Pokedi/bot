import { ClusterClient, getInfo } from "discord-hybrid-sharding";

import { Collection, Client, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import prisma from "../Database/index.js";

const client = new Client({
    shards: getInfo().SHARD_LIST, // An array of shards that will get spawned
    shardCount: getInfo().TOTAL_SHARDS, // Total number of shards
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessages]
});

client.cluster = new ClusterClient(client); // initialize the Client, so we access the .broadcastEval()

client.commands = new Collection();

client.prisma = prisma;

import sql from "../Database/postgres.js";
client.postgres = sql;

import interactionCreateHandler from "../../Handlers/interactionCreateHandler.js";
client.on('interactionCreate', interactionCreateHandler);

import messageCreate from "../../Handlers/messageCreate.js";
client.on("messageCreate", messageCreate);

// Ready all Commands
import commandsInit from "../../Utilities/Core/commandsInit.js";
commandsInit(undefined, client);

client.login(process.env.DEVTOKEN);

export { client, prisma };