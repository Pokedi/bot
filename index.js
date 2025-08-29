// Initializing Env files
import * as dotenv from 'dotenv'
dotenv.config({ override: true, quiet: true });

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
    token: process.env.TOKEN
});

// Ready Pokemon Server
import Server from './Services/Server/index.js';

manager.on('clusterCreate', cluster => console.log(`Launched Cluster ${cluster.id}`));

// Cron
import { CronJob } from "cron";

import postgres from "./Modules/Database/postgres.js"

// Check every week for Pokemon in the market and remove them if the timestamp has passed
const job = new CronJob('0 0 * * 0', () => {
    
    // Every Sunday at midnight
    console.log('Running weekly job to check market for expired Pokémon...');

    // Forgive and Forget
    postgres.begin(async sql => {
        const expired = await sql`
    WITH expired AS (
      SELECT id
      FROM market
      WHERE NOW() - timestamp > INTERVAL '14 days'
    ),
    upd AS (
      UPDATE pokemon
      SET market = false
      WHERE id IN (SELECT id FROM expired)
      RETURNING id
    )
    DELETE FROM market
    WHERE id IN (SELECT id FROM expired)
  `;
    });

}, null, true, 'America/New_York');

manager.spawn({ timeout: -1 });
