import { ChessBoard } from "../game_src/ChessBoard"
import { logicalToVisual } from "../game_src/util"
import { TChessGameState } from "../types/chess.types"

export function getGameState(game: ChessBoard, gameID: string): TChessGameState {
    return {
        gameID,
        positions: game.positions,
        currentTurn: game.currentTurn,
        check: game.check ? logicalToVisual(game.check.position) : null,
        checkers: game.checkers?.length ? game.checkers.map(checker => logicalToVisual(checker.position)) : [],
        checkmate: game.checkmate,
        stalemate: game.stalemate,
        draw: game.draw,
        canClaimDraw: game.canClaimDraw,
        isForcedDraw: game.isForcedDraw,
        eligibleForPromotion: game.eligibleForPromotion ? logicalToVisual(game.eligibleForPromotion.position) : null
    }
}