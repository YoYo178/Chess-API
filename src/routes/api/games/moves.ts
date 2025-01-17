import { Request, Response, Router } from "express";
let router: Router = Router({ mergeParams: true });

import { encodeMove, games, visualToLogical, logicalToVisual } from "../../../game_src/util.js";
import { CHESS_MOVE_RESPONSES } from "../../../game_src/ChessVariables.js";
import { ChessPiece } from "../../../game_src/ChessPiece.js";

router.get("/:pos", (req: Request, res: Response) => {
	let id = req.params.gameID;
	let game = games.get(id);

	if (!game) {
		res.redirect("/404");
		return;
	}

	let pos = req.params.pos;
	let piece = game.getPieceOnPosition(visualToLogical(pos));

	if (!piece) {
		res.status(404).send({ status: "failed", message: "No piece exists on the specified position." });
		return;
	}

	try {
		let moves = piece.getMovablePositions().map(encodeMove);
		res.send({ status: "success", moves });
	} catch (error) {
		res.status(501).send({ status: "failed", message: "An error occured while generating moves." });
		return console.error(error);
	}
})

router.post("/:pos", (req: Request, res: Response) => {
	let id = req.params.gameID;
	let game = games.get(id);

	if (!game || !req.body.moveTo) {
		res.redirect("/404");
		return;
	}

	let pos = req.params.pos;
	let piece = game.getPieceOnPosition(visualToLogical(pos));

	if (!piece) {
		res.status(404).send({ status: "failed", message: "No piece exists on the specified position." });
		return;
	}

	try {
		let status: CHESS_MOVE_RESPONSES = CHESS_MOVE_RESPONSES.SUCCESSFUL;
		const moveTo = visualToLogical(req.body.moveTo);

		if (req.body.killPos) {
			const killTarget = game.getPieceOnPosition(visualToLogical(req.body.killPos));

			if (killTarget) {
				status = game.kill(piece, moveTo, killTarget);
			}
		} else {
			status = game.move(piece, moveTo);
		}

		if (status === CHESS_MOVE_RESPONSES.INVALID_MOVE) {
			res.status(400).send({ status: "failed", message: "Invalid move." });
			return;
		}

		if (status === CHESS_MOVE_RESPONSES.INVALID_TURN) {
			res.status(400).send({ status: "failed", message: "It is not your turn." });
			return;
		}

		if (req.body.promoteTo) {
			piece.promote(req.body.promoteTo);
		}

		if (req.body.castleTarget) {
			const castlePos = visualToLogical(req.body.castleTarget);
			const castleTarget = game.getPieceOnPosition(castlePos);

			if(castleTarget) {
				piece.castle(castleTarget);
			}
		}

		let sendObj = {
			status: "success",
			gameID: id,
			positions: game.positions,
			currentTurn: game.currentTurn,
			check: game.check ? logicalToVisual(game.check.position) : null,
			checkers: game.checkers.length ? game.checkers.map((checker: ChessPiece) => { return logicalToVisual(checker.position) }) : game.checkers,
			checkmate: game.checkmate,
			stalemate: game.stalemate
		};

		res.send(sendObj);
	} catch (error) {
		res.status(501).send({ status: "failed", message: "An error occured while trying to move the specified piece." });
		return console.error(error);
	}
})

export default router;
