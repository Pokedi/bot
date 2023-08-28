import { createClient } from "redis";

const redisClient = createClient();

try {
    await redisClient.connect();
} catch (error) {
    console.log("Redis not connected!");
}

export default redisClient;