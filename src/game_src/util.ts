import { ChessBoard } from "./ChessBoard";
import { TChessMove, TChessPosition } from "../types/ChessTypes";
import { ChessPiece } from "./ChessPiece";

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
export function createMove(piece: ChessPiece, x: number, y: number): TChessMove {
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

	piece.moves.push(move);
	return move;
}

export function createKillingMove(piece: ChessPiece, x: number, y: number, targetPiece: ChessPiece): void {
	piece.moves.push({
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
	})
}

export function createCastlingMove(piece: ChessPiece, x: number, y: number, targetPiece: ChessPiece): void {
	piece.moves.push({
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
	})
}

export function createEnPassantMove(piece: ChessPiece, x: number, y: number, targetPiece: ChessPiece): void {
	piece.moves.push({
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
	})
}

export function createFriendlyMove(piece: ChessPiece, x: number, y: number): void {
	piece.moves.push({
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
	})
}

export function createPawnMove(piece: ChessPiece, x: number, y: number): void {
	piece.moves.push({
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
	})
}

export function createPawnPromotingMove(piece: ChessPiece, x: number, y: number): void {
	piece.moves.push({
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
	})
}

export function createPawnDiagonalMove(piece: ChessPiece, x: number, y: number): void {
	piece.moves.push({
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
	})
}

export function createPawnDiagonalKillingMove(piece: ChessPiece, x: number, y: number, targetPiece: ChessPiece): void {
	piece.moves.push({
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
	})
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