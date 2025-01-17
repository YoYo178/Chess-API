import { ChessPiece } from "../game_src/ChessPiece";

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