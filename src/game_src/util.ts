import { ChessBoard } from "./ChessBoard";
import { TChessMove, TChessPosition } from "../types/ChessTypes";
import { ChessPiece } from "./ChessPiece";
import { CHESS_PIECE_UNICODE } from "./ChessVariables";

let usedPieceKeys: string[] = [];

export function getChessPieceKey(strPiece: string) {

    if(usedPieceKeys.length >= 32)
        usedPieceKeys = [];

    const pieceCode = strPiece.charCodeAt(0);
    let str = [];
    let usedIndex = 1;

    if (pieceCode >= CHESS_PIECE_UNICODE.BLACK_KING && pieceCode <= CHESS_PIECE_UNICODE.BLACK_PAWN) {
        str.push("B_");
    } else {
        str.push("W_");
    }

    switch (pieceCode) {
        case CHESS_PIECE_UNICODE.BLACK_KING:
        case CHESS_PIECE_UNICODE.WHITE_KING:
            str.push("K");
            break;

        case CHESS_PIECE_UNICODE.BLACK_QUEEN:
        case CHESS_PIECE_UNICODE.WHITE_QUEEN:
            str.push("Q");
            break;

        case CHESS_PIECE_UNICODE.BLACK_ROOK:
        case CHESS_PIECE_UNICODE.WHITE_ROOK:
            str.push("R");
            break;

        case CHESS_PIECE_UNICODE.BLACK_BISHOP:
        case CHESS_PIECE_UNICODE.WHITE_BISHOP:
            str.push("B");
            break;

        case CHESS_PIECE_UNICODE.BLACK_KNIGHT:
        case CHESS_PIECE_UNICODE.WHITE_KNIGHT:
            str.push("N");
            break;

        case CHESS_PIECE_UNICODE.BLACK_PAWN:
        case CHESS_PIECE_UNICODE.WHITE_PAWN:
            str.push("P");
            break;
    }

    str.push(String(usedIndex))

    let finalString = str.join("");
    
    while(usedPieceKeys.includes(finalString) && usedIndex < 8) {
        usedIndex++;
        str[str.length - 1] = String(usedIndex);
        finalString = str.join("");
    }

    usedPieceKeys.push(finalString)
    return finalString;
}

export function objIncludes(obj: any, element: any): boolean {
	let res = false;
	for (let value of Object.values(obj)) {
		if (value === element) {
			res = true;
			break;
		}
	}

	return res;
}

export function logicalToVisual(pos: TChessPosition): string {
	return String.fromCharCode(pos.x + 97) + String(8 - pos.y)
}

export function visualToLogical(strPos: string): TChessPosition {
	return {
		x: strPos[0].charCodeAt(0) - 97,
		y: 8 - +strPos[1]
	}
}

export function generateGameID(length: number): string {
	let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	let result = '';
	for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
	return result;
}

// helper functions
export function createMove(x: number, y: number): TChessMove {
	let move: TChessMove = {
		x,
		y,
		killTarget: null,
		castleTarget: null,
		isKillingMove: false,
		isEnPassant: false,
		isFriendlyPiece: false,
		isAttackableMove: true,
		isPawnDiagonal: false,
		isPromotingMove: false,
		isCastlingMove: false
	};

	return move;
}

export function createKillingMove(x: number, y: number, targetPiece: ChessPiece): TChessMove {
	const move = {
		x,
		y,
		killTarget: targetPiece,
		castleTarget: null,
		isKillingMove: true,
		isEnPassant: false,
		isFriendlyPiece: false,
		isAttackableMove: true,
		isPawnDiagonal: false,
		isPromotingMove: false,
		isCastlingMove: false
	};

	return move;
}

export function createCastlingMove(x: number, y: number, targetPiece: ChessPiece): TChessMove {
	const move = {
		x,
		y,
		killTarget: null,
		castleTarget: targetPiece,
		isKillingMove: false,
		isEnPassant: false,
		isFriendlyPiece: false,
		isAttackableMove: false,
		isPawnDiagonal: false,
		isPromotingMove: false,
		isCastlingMove: true
	};

	return move;
}

export function createEnPassantMove(x: number, y: number, targetPiece: ChessPiece): TChessMove {
	const move = {
		x,
		y,
		killTarget: targetPiece,
		castleTarget: null,
		isKillingMove: true,
		isEnPassant: true,
		isFriendlyPiece: false,
		isAttackableMove: true,
		isPawnDiagonal: false,
		isPromotingMove: false,
		isCastlingMove: false
	};

	return move;
}

export function createFriendlyMove(x: number, y: number): TChessMove {
	const move = {
		x,
		y,
		killTarget: null,
		castleTarget: null,
		isKillingMove: false,
		isEnPassant: false,
		isFriendlyPiece: true,
		isAttackableMove: true,
		isPawnDiagonal: false,
		isPromotingMove: false,
		isCastlingMove: false
	};

	return move;
}

export function createPawnMove(x: number, y: number): TChessMove {
	const move = {
		x,
		y,
		killTarget: null,
		castleTarget: null,
		isKillingMove: false,
		isEnPassant: false,
		isFriendlyPiece: false,
		isAttackableMove: false,
		isPawnDiagonal: false,
		isPromotingMove: false,
		isCastlingMove: false
	};

	return move;
}

export function createPawnPromotingMove(x: number, y: number): TChessMove {
	const move = {
		x,
		y,
		killTarget: null,
		castleTarget: null,
		isKillingMove: false,
		isEnPassant: false,
		isFriendlyPiece: false,
		isAttackableMove: false,
		isPawnDiagonal: false,
		isPromotingMove: true,
		isCastlingMove: false
	};

	return move;
}

export function createPawnDiagonalMove(x: number, y: number): TChessMove {
	const move = {
		x,
		y,
		killTarget: null,
		castleTarget: null,
		isKillingMove: false,
		isEnPassant: false,
		isFriendlyPiece: false,
		isAttackableMove: true,
		isPawnDiagonal: true,
		isPromotingMove: false,
		isCastlingMove: false
	};

	return move;
}

export function createPawnDiagonalKillingMove(x: number, y: number, targetPiece: ChessPiece): TChessMove {
	const move = {
		x,
		y,
		killTarget: targetPiece,
		castleTarget: null,
		isKillingMove: true,
		isEnPassant: false,
		isFriendlyPiece: false,
		isAttackableMove: true,
		isPawnDiagonal: true,
		isPromotingMove: false,
		isCastlingMove: false
	};

	return move;
}

export const games: Map<string, ChessBoard> = new Map();

export function encodeMove(moveObj: TChessMove) {
	let move = logicalToVisual(moveObj)
	move += ":"

	if (moveObj.isPromotingMove)
		move += "*"

	if (moveObj.isPawnDiagonal)
		move += "/"

	if (moveObj.isAttackableMove)
		move += "#"

	if (moveObj.isEnPassant)
		move += "^"

	if (moveObj.isFriendlyPiece)
		move += "@"

	if (moveObj.isKillingMove)
		move += "!" + (moveObj.killTarget ? logicalToVisual(moveObj.killTarget.position) : "")

	if (moveObj.isCastlingMove)
		move += "$" + (moveObj.castleTarget ? logicalToVisual(moveObj.castleTarget.position) : "")

	return move
}

export function getDirection(start: TChessPosition, dest: TChessPosition): TChessPosition {
	return { x: dest.x - start.x, y: dest.y - start.y }
}

export function getLowerDiagonalBounds(pos: TChessPosition, mode: "acw" | "cw"): TChessPosition {
	let retObj = { x: pos.x, y: pos.y }

	switch (mode) {
		case "acw": {
			while (retObj.x > 0 && retObj.y > 0) {
				retObj.x--;
				retObj.y--;
			}
			break;
		}

		case "cw": {
			while (retObj.x < 7 && retObj.y > 0) {
				retObj.x++;
				retObj.y--;
			}
			break;
		}
	}

	return retObj
}

export function checkSameDiagonal(...args: any): boolean {
	let res = false;

	if (!arguments.length)
		return res;

	let posArr: TChessPosition[] = Array.from(arguments);

	let acwArr = posArr.map((pos: TChessPosition) => getLowerDiagonalBounds(pos, "acw"));
	let cwArr = posArr.map((pos: TChessPosition) => getLowerDiagonalBounds(pos, "cw"));

	res = acwArr.every((pos: TChessPosition) => pos.x === acwArr[0].x && pos.y === acwArr[0].y) || cwArr.every((pos: TChessPosition) => pos.x === cwArr[0].x && pos.y === cwArr[0].y);

	return res;
}