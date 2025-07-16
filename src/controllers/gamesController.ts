import type { Request, Response } from "express";

import { ChessBoard } from "../game_src/ChessBoard";
import { ChessPiece } from "../game_src/ChessPiece";
import { games, generateGameID, logicalToVisual } from "../game_src/util";

// Get status
export const getStatus = async (req: Request, res: Response) => {
    res.status(200).send({ status: "success", timestamp: Date.now(), games: [...games.keys()] });
}

// Generate a new game
export const generateNewGame = async (req: Request, res: Response) => {
    let gameID = generateGameID(6);

    // Just in case we roll an already existing ID, we re-roll for a maximum of 3 tries
    if (games.get(gameID)) {
        for (let i = 0; i < 3; i++) {
            gameID = generateGameID(6)
        }
    }

    try {
        const game: ChessBoard = new ChessBoard();
        await game.init();
        games.set(gameID, game);

        const sendObj = {
            status: "success",
            game: {
                gameID,
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

        res.send(sendObj);
    } catch (error) {
        res.status(500).send({ status: "failed", message: "An error occured while generating a new game." })
        return console.error(error)
    }
}

export const getGameStatus = async (req: Request, res: Response) => {
    const id = req.params.gameID;
    const game = games.get(id);

    if (!game) {
        res.redirect("/404");
        return;
    }

    const sendObj = {
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
}