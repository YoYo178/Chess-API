import express from "express";
let router = express.Router();

import newRouter from "./new.js";
import movesRouter from "./moves.js"

import { games } from "../../../game_src/util.js";

router.get("/", (req, res) => {
    res.status(200).send({ status: "success", timestamp: Date.now() });
})

router.use("/new", newRouter);
router.use("/:gameID/moves", movesRouter)

router.get("/:gameID", (req, res) => {
    let id = req.params.gameID;
    let game = games.get(id);

    if (!game)
        return res.redirect("/404");

    res.send({ status: "success", gameID: id, positions: game.positions, currentTurn: game.currentTurn, check: game.check })
})


export default router;
