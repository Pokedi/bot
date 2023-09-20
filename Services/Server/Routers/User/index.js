import { Router } from "express";
import { idx } from "../../cache.js";
import client from "../../../../Modules/Database/index.js";

const userRouter = Router();

userRouter.get('/idx/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) return res.sendStatus(403);

    const idxFound = idx.get(id);

    if (idxFound) return res.json({ idx: idxFound });

    const foundPokemon = await client.pokemon.findFirst({
        where: {
            user_id: BigInt(id)
        },
        select: {
            idx: true
        },
        orderBy: {
            idx: "desc"
        }
    });

    idx.set(id, foundPokemon ? foundPokemon.idx : 1);
    return res.json({ idx: idx.get(id) });
});

export default userRouter;