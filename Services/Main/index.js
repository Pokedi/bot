import { ClusterClient, getInfo } from "discord-hybrid-sharding";
import Discord from "discord.js";

const client = new Discord.Client({
    shards: getInfo().SHARD_LIST, // An array of shards that will get spawned
    shardCount: getInfo().TOTAL_SHARDS, // Total number of shards
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS]
});

client.cluster = new ClusterClient(client); // initialize the Client, so we access the .broadcastEval()

client.login(process.env.DEVTOKEN);

export default client;