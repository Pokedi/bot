import { Router } from "express";
import sql from "../../../../Modules/Database/postgres.js";

const voteRouter = Router();

voteRouter.get('/', (req, res) =>
    res.sendStatus(200)
);

voteRouter.get("/TopGG", (req, res) => {
    console.log(req.body, req.query)
});

export default voteRouter;