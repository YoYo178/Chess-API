import { ChessPiece } from "@/game_src/ChessPiece.js";
import { CHESS_COLOR } from "@/game_src/ChessVariables.js";

export interface TChessPosition {
    x: number;
    y: number;
}

export interface TChessMove {
    x: number;
    y: number;
    killTarget: ChessPiece | null;
    castleTarget: ChessPiece | null;
    attackingPiece?: ChessPiece;
    isKillingMove: boolean;
    isEnPassant: boolean;
    isFriendlyPiece: boolean;
    isAttackableMove: boolean;
    isPawnDiagonal: boolean;
    isPromotingMove: boolean;
    isCastlingMove: boolean;
}

export interface TChessPlayer {
    name: string;
    id: string;
}

export interface TChessGameState {
    /** The game's unique ID */
    gameID: string;

    /** The IDs of the players playing the game */
    players: ({ name: string, color: CHESS_COLOR } | null)[];

    /** The game's piece positions */
    positions: string[][];

    /** The color of the player to move */
    currentTurn: 'white' | 'black';

    /** The position of the checked king */
    check: string | null;

    /** The checker(s) attacking the king */
    checkers: string[];

    /** The position of the pawn eligible for promotion */
    eligibleForPromotion: string | null;

    /** True if the game ended in a checkmate */
    checkmate: boolean;

    /** True if the game ended in a stalemate */
    stalemate: boolean;

    /** True if the game ended in a draw */
    draw: boolean;

    /** Has the game started or not */
    hasStarted: boolean;

    /** If true, lets players can claim a draw (50 Move Rule) (TODO) */
    canClaimDraw: boolean;

    /** If true, Forces a draw (75 Move Rule) (TODO) */
    isForcedDraw: boolean;
}