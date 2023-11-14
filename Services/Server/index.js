import express from "express";

const Server = express();

Server.get("/", (req, res) => {
    res.json({ ok: true });
})

// Dialga Number
const port = 483;

// User Router
import userRouter from "./Routers/User/index.js";
Server.use('/user/', userRouter);

// Vote Router
import voteRouter from "./Routers/Votes/index.js";
Server.use("/vote/", voteRouter);

if (!process.env.DEV)
    Server.listen(port, () => {
        console.log("Pokemon Server running on port:", port)
    });

export default Server;
