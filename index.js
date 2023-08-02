// Initializing Env files
import * as dotenv from 'dotenv'
dotenv.config()

// __DIRNAME
import path from 'path';
const __dirname = path.resolve(path.dirname(''));

import { ClusterManager } from "discord-hybrid-sharding";

const manager = new ClusterManager(`${__dirname}/Services/Main/index.js`, {
    totalShards: 'auto', // or 'auto'
    /// Check below for more options
    shardsPerClusters: 2,
    // totalClusters: 7,
    mode: 'process',  // you can also choose "worker"
    token: process.env.DEVTOKEN
});

// Ready Pokemon Server
import Server from './Services/Server/index.js';

manager.on('clusterCreate', cluster => console.log(`Launched Cluster ${cluster.id}`));

manager.spawn({ timeout: -1 });