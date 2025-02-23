import { Request, Response, Router } from "express";
let router: Router = Router();

import newRouter from "./new.js";
import movesRouter from "./moves.js"

import { games, logicalToVisual } from "../../../game_src/util.js";
import { ChessPiece } from "../../../game_src/ChessPiece.js";

router.get("/", (req: Request, res: Response) => {
	res.status(200).send({ status: "success", timestamp: Date.now(), games: [...games.keys()] });
})

router.use("/new", newRouter);
router.use("/:gameID/moves", movesRouter)

router.get("/:gameID", (req: Request, res: Response) => {
	let id = req.params.gameID;
	let game = games.get(id);

	if (!game) {
		res.redirect("/404");
		return;
	}

	let sendObj = {
		status: "success",
		game: {
			gameID: id,
			positions: game.positions,
			currentTurn: game.currentTurn,
			check: game.check ? logicalToVisual(game.check.position) : null,
			checkers: game.checkers.length ? game.checkers.map((checker: ChessPiece) => { return logicalToVisual(checker.position) }) : game.checkers,
			checkmate: game.checkmate,
			stalemate: game.stalemate,
			draw: game.draw,
			canClaimDraw: game.canClaimDraw,
			isForcedDraw: game.isForcedDraw,
			eligibleForPromotion: game.eligibleForPromotion ? logicalToVisual(game.eligibleForPromotion.position) : null
		}
	}

	res.send(sendObj)
})


export default router;
