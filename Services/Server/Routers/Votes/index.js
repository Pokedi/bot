import express, { Router, urlencoded } from "express";

import sql from "../../../../Modules/Database/postgres.js";

import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

import { randomSelectCrate } from "../../utils/determineCrate.js";
import Player from "../../../../Classes/player.js";

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

    const crate = randomSelectCrate();

    const player = new Player({ id: user });

    await player.fetchColumns(sql, "id, started");

    if (!player.started)
        return res.sendStatus(200);

    try {
        await sql.begin(x => ([x`INSERT INTO user_vote ${sql({
            id: user,
            type: "top",
            total_votes: 1,
            last_voted: new Date()
        })} ON CONFLICT (id, type) DO UPDATE SET 
        streak = (CASE WHEN (extract(epoch from now()) - extract(epoch from user_vote.last_voted)) < (extract(epoch from interval '12 hours')) THEN (user_vote.streak + 1) ELSE 0 END),
        last_voted = EXCLUDED.last_voted, total_votes = user_vote.total_votes + 1`, x`INSERT INTO user_inventory ${sql({
            user_id: user,
            item_id: crate.id,
            amount: 1
        })} ON CONFLICT (user_id, item_id) DO UPDATE SET amount = user_inventory.amount + 1`]));

        const discordUser = await bot.post(Routes.userChannels(), {
            body: {
                recipient_id: user
            }
        });

        if (discordUser.id)
            await bot.post(Routes.channelMessages(discordUser.id), {
                body: {
                    content: `Congratulations! You recieved the ${crate.name}!`
                }
            });
    } catch (error) {
        console.log(error);
    }

    res.sendStatus(200);
});

export default voteRouter;