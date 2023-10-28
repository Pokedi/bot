import express, { Router, urlencoded } from "express";

import sql from "../../../../Modules/Database/postgres.js";

import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

import { generateCrate } from "../../utils/determineCrate.js";
import Player from "../../../../Classes/player.js";
import generateCrateRewardSQL from "../../utils/generateCrateRewardSQL.js";

// Init Bot
const bot = new REST({ version: '10' }).setToken(process.env.MAINTOKEN);

const voteRouter = Router();

voteRouter.use(urlencoded());
voteRouter.use(express.json());

voteRouter.get('/', (req, res) =>
    res.sendStatus(200)
);

voteRouter.post("/topgg", async (req, res) => {
    const { user } = req.body;

    if (!user)
        return res.sendStatus(400);

    const crate = generateCrate();

    const player = new Player({ id: user });

    await player.fetchColumns(sql, "id, started");

    if (!player.started)
        return res.sendStatus(200);

    try {
        await sql.begin(x => generateCrateRewardSQL(crate.items, user, x).concat([x`INSERT INTO user_vote ${sql({
            id: user,
            type: "top",
            total_votes: 1,
            last_voted: new Date()
        })} ON CONFLICT (id, type) DO UPDATE SET 
        streak = (CASE WHEN (extract(epoch from now()) - extract(epoch from user_vote.last_voted)) < (extract(epoch from interval '12 hours')) THEN (user_vote.streak + 1) ELSE 0 END),
        last_voted = EXCLUDED.last_voted, total_votes = user_vote.total_votes + 1`]));

        const discordUser = await bot.post(Routes.userChannels(), {
            body: {
                recipient_id: user
            }
        });

        if (discordUser.id)
            await bot.post(Routes.channelMessages(discordUser.id), {
                body: {
                    content: `Congratulations! You opened the ${crate.name}! Rewards:\n${crate.items.map(x => `- ${x.name} (${x.amount})`).join("\n")}`
                }
            });
    } catch (error) {
        console.log(error);
    }

    res.sendStatus(200);
});

export default voteRouter;