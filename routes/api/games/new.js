import express from "express";
let router = express.Router();

import { ChessBoard } from '../../../game_src/ChessBoard.js';
import { games, generateGameID, logicalToVisual } from "../../../game_src/util.js";

router.get("/", (req, res) => {
	let gameID = ""
	do {
		gameID = generateGameID(6);
	}
	while (games.get(gameID));

	try {
		let game = new ChessBoard();
		game.init();
		games.set(gameID, game);

		let sendObj = {
			status: "success",
			gameID,
			positions: game.positions,
			currentTurn: game.currentTurn,
			check: game.check ? logicalToVisual(game.check.position) : null,
			checkers: game.checkers.length ? game.checkers.map(e => { return logicalToVisual(e.position) }) : game.checkers,
			checkmate: game.checkmate,
			stalemate: game.stalemate
		}

		res.send(sendObj);
	} catch (error) {
		res.status(500).send({ status: "failed", message: "An error occured while generating a new game." })
		return console.error(error)
	}
})

export default router;
