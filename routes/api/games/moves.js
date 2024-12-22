import express from "express";
let router = express.Router({ mergeParams: true });

import { encodeMove, games, visualToLogical, logicalToVisual } from "../../../game_src/util.js";
import { CHESS_MOVE_RESPONSES } from "../../../game_src/ChessVariables.js";

router.get("/:pos", (req, res) => {
	let id = req.params.gameID
	let game = games.get(id)

	if (!game)
		return res.redirect("/404");

	let pos = req.params.pos
	let piece = game.getPieceOnPosition(visualToLogical(pos))

	if (!piece)
		return res.status(404).send({ status: "failed", message: "No piece exists on the specified position." });

	try {
		let moves = piece.getMovablePositions().map(encodeMove)
		res.send({ status: "success", moves })
	} catch (error) {
		res.status(501).send({ status: "failed", message: "An error occured while generating moves." })
		return console.error(error)
	}
})

router.post("/:pos", (req, res) => {
	let id = req.params.gameID
	let game = games.get(id)

	if (!game || !req.body.moveTo)
		return res.redirect("/404");

	let pos = req.params.pos
	let piece = game.getPieceOnPosition(visualToLogical(pos))

	if (!piece)
		return res.status(404).send({ status: "failed", message: "No piece exists on the specified position." });

	try {
		let status = req.body.killPos ?
			game.kill(piece, visualToLogical(req.body.moveTo), game.getPieceOnPosition(visualToLogical(req.body.killPos))) :
			game.move(piece, visualToLogical(req.body.moveTo))

		if(status === CHESS_MOVE_RESPONSES.INVALID_MOVE)
		{
			return res.status(400).send({ status: "failed", message: "Invalid move."})
		}

		if(status === CHESS_MOVE_RESPONSES.INVALID_TURN)
		{
			return res.status(400).send({ status: "failed", message: "It is not your turn."})
		}

		if (req.body.promoteTo)
			piece.promote(req.body.promoteTo)

		if (req.body.castleTarget)
			piece.castle(game.getPieceOnPosition(visualToLogical(req.body.castleTarget)))

		let sendObj = {
			status: "success",
			gameID: id,
			positions: game.positions,
			currentTurn: game.currentTurn,
			check: game.check ? logicalToVisual(game.check.position) : null,
			checkers: game.checkers.length ? game.checkers.map(e => { return logicalToVisual(e.position) }) : game.checkers,
			checkmate: game.checkmate,
			stalemate: game.stalemate
		}
			res.send(sendObj)
	} catch (error) {
		res.status(501).send({ status: "failed", message: "An error occured while trying to move the specified piece." })
		return console.error(error)
	}
})

export default router;
