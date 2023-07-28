import express from "express";

const Server = express();

Server.get("/", (req, res) => {
    res.json({ ok: true });
})

// Dialga Number
const port = 483;

Server.listen(port, ()=>{
    console.log("Pokemon Server running on port:", port)
});

export default Server;