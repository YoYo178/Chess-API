export function objIncludes(obj, element) {
	let res = false;
	for (let value of Object.values(obj)) {
		if (value === element) {
			res = true;
			break;
		}
	}

	return res;
}

export function logicalToVisual(pos) {
	return String.fromCharCode(pos.x + 97) + String(8 - pos.y)
}

export function visualToLogical(strPos) {
	return {
		x: strPos[0].charCodeAt(0) - 97,
		y: 8 - +strPos[1]
	}
}

export function generateGameID(length) {
	let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	let result = '';
	for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
	return result;
}

// helper functions
export function createMove(piece, x, y) {
	piece.moves.push({
		x,
		y,
		killTarget: null,
		isKillingMove: false,
		isEnPassant: false,
		isFriendlyPiece: false,
		isAttackableMove: true,
		isPawnDiagonal: false
	})
}

export function createKillingMove(piece, x, y, targetPiece) {
	piece.moves.push({
		x,
		y,
		killTarget: targetPiece,
		isKillingMove: true,
		isEnPassant: false,
		isFriendlyPiece: false,
		isAttackableMove: true,
		isPawnDiagonal: false
	})
}

export function createEnPassantMove(piece, x, y, targetPiece) {
	piece.moves.push({
		x,
		y,
		killTarget: targetPiece,
		isKillingMove: true,
		isEnPassant: true,
		isFriendlyPiece: false,
		isAttackableMove: true,
		isPawnDiagonal: false
	})
}

export function createFriendlyMove(piece, x, y) {
	piece.moves.push({
		x,
		y,
		killTarget: null,
		isKillingMove: false,
		isEnPassant: false,
		isFriendlyPiece: true,
		isAttackableMove: true,
		isPawnDiagonal: false
	})
}

export function createPawnMove(piece, x, y) {
	piece.moves.push({
		x,
		y,
		killTarget: null,
		isKillingMove: false,
		isEnPassant: false,
		isFriendlyPiece: false,
		isAttackableMove: false,
		isPawnDiagonal: false
	})
}

export function createPawnDiagonalMove(piece, x, y) {
	piece.moves.push({
		x,
		y,
		killTarget: null,
		isKillingMove: false,
		isEnPassant: false,
		isFriendlyPiece: false,
		isAttackableMove: true,
		isPawnDiagonal: true
	})
}

export function createPawnDiagonalKillingMove(piece, x, y, targetPiece) {
	piece.moves.push({
		x,
		y,
		killTarget: targetPiece,
		isKillingMove: true,
		isEnPassant: false,
		isFriendlyPiece: false,
		isAttackableMove: true,
		isPawnDiagonal: true
	})
}

export const games = new Map();

export function encodeMove(moveObj) {
	let move = logicalToVisual(moveObj)
	move += ":"
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

	return move
}

export function getDirection(start, dest) {
	return { x: dest.x - start.x, y: dest.y - start.y }
}