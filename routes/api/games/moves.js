import express from "express";
let router = express.Router({ mergeParams: true });

import { games, visualToLogical } from "../../../game_src/util.js";

router.get("/:pos", (req, res) => {
    let id = req.params.gameID
    let game = games.get(id)

    if (!game)
        return res.redirect("/404");

    let pos = req.params.pos
    let piece = game.getPieceOnPosition(visualToLogical(pos))
    let moves = piece.getMovablePositions()
    res.send({ status: "success", moves })
})

router.post("/:pos", (req, res) => {
    let id = req.params.gameID
    let game = games.get(id)

    if (!game || !req.body.moveTo)
        return res.redirect("/404");

    let pos = req.params.pos
    let piece = game.getPieceOnPosition(visualToLogical(pos))
    game.move(piece, visualToLogical(req.body.moveTo))
    res.send({ status: "success", positions: game.positions })
})

export default router;
