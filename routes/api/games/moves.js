import express from "express";
let router = express.Router({ mergeParams: true });

import { encodeMove, games, visualToLogical, logicalToVisual } from "../../../game_src/util.js";

router.get("/:pos", (req, res) => {
    let id = req.params.gameID
    let game = games.get(id)

    if (!game)
        return res.redirect("/404");

    let pos = req.params.pos
    let piece = game.getPieceOnPosition(visualToLogical(pos))
    let moves = piece.getMovablePositions().map(encodeMove)
    res.send({ status: "success", moves })
})

router.post("/:pos", (req, res) => {
    let id = req.params.gameID
    let game = games.get(id)

    if (!game || !req.body.moveTo)
        return res.redirect("/404");

    let pos = req.params.pos
    let piece = game.getPieceOnPosition(visualToLogical(pos))
    req.body.killPos ?
        game.kill(piece, visualToLogical(req.body.moveTo), game.getPieceOnPosition(visualToLogical(req.body.killPos))) :
        game.move(piece, visualToLogical(req.body.moveTo))

    let sendObj = {
        status: "success",
        gameID: id,
        positions: game.positions,
        currentTurn: game.currentTurn,
        check: game.check,
        checked: game.checked ? logicalToVisual(game.checked.position) : null,
        checkers: game.checkers.length ? game.checkers.map(e => { return logicalToVisual(e.position) }) : game.checkers
    }

    res.send(sendObj)
})

export default router;
