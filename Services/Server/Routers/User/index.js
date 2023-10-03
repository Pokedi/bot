import { Router } from "express";
import { idx } from "../../cache.js";
import sql from "../../../../Modules/Database/postgres.js";

const userRouter = Router();

userRouter.get('/idx/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) return res.sendStatus(403);

    const idxFound = idx.get(id);

    if (idxFound) return res.json({ idx: idxFound });

    const [foundPokemon] = await sql`SELECT idx FROM pokemon WHERE user_id = ${id} ORDER BY idx DESC`;

    idx.set(id, foundPokemon ? foundPokemon.idx : 1);
    return res.json({ idx: idx.get(id) });
});

export default userRouter;