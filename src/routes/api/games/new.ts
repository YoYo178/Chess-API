import { Request, Response, Router } from "express";
let router: Router = Router();

import { ChessBoard } from '../../../game_src/ChessBoard.js';
import { games, generateGameID, logicalToVisual } from "../../../game_src/util.js";
import { ChessPiece } from "../../../game_src/ChessPiece.js";

router.get("/", (req: Request, res: Response) => {
	let gameID = ""
	do {
		gameID = generateGameID(6);
	}
	while (games.get(gameID));

	try {
		let game: ChessBoard = new ChessBoard();
		game.init();
		games.set(gameID, game);

		let sendObj = {
			status: "success",
			gameID,
			positions: game.positions,
			currentTurn: game.currentTurn,
			check: game.check ? logicalToVisual(game.check.position) : null,
			checkers: game.checkers.length ? game.checkers.map((checker: ChessPiece) => { return logicalToVisual(checker.position) }) : game.checkers,
			checkmate: game.checkmate,
			stalemate: game.stalemate,
			eligibleForPromotion: game.eligibleForPromotion
		}

		res.send(sendObj);
	} catch (error) {
		res.status(500).send({ status: "failed", message: "An error occured while generating a new game." })
		return console.error(error)
	}
})

export default router;
