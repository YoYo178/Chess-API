import { ChessBoard } from "@/game_src/ChessBoard.js"
import { logicalToVisual } from "@/game_src/util.js"
import type { TChessGameState } from "@/types/chess.types.js"

export function getGameState(game: ChessBoard, gameID: string): TChessGameState {
    return {
        gameID,

        players: game.players,

        positions: game.positions,
        currentTurn: game.currentTurn,

        check: game.check ? logicalToVisual(game.check.position) : null,
        checkers: game.checkers?.length ? game.checkers.map(checker => logicalToVisual(checker.position)) : [],

        eligibleForPromotion: game.eligibleForPromotion ? logicalToVisual(game.eligibleForPromotion.position) : null,

        checkmate: game.checkmate,
        stalemate: game.stalemate,
        draw: game.draw,

        hasStarted: game.players.length === 2,

        canClaimDraw: game.canClaimDraw,
        isForcedDraw: game.isForcedDraw,
    }
}