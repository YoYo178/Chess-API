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
		castleTarget: null,
		isKillingMove: false,
		isEnPassant: false,
		isFriendlyPiece: false,
		isAttackableMove: true,
		isPawnDiagonal: false,
		isPromotingMove: false,
		isCastlingMove: false
	})
}

export function createKillingMove(piece, x, y, targetPiece) {
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

export function createCastlingMove(piece, x, y, targetPiece) {
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

export function createEnPassantMove(piece, x, y, targetPiece) {
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

export function createFriendlyMove(piece, x, y) {
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

export function createPawnMove(piece, x, y) {
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

export function createPawnPromotingMove(piece, x, y) {
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

export function createPawnDiagonalMove(piece, x, y) {
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

export function createPawnDiagonalKillingMove(piece, x, y, targetPiece) {
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

export const games = new Map();

export function encodeMove(moveObj) {
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

export function getDirection(start, dest) {
	return { x: dest.x - start.x, y: dest.y - start.y }
}

export function getLowerDiagonalBounds(pos, mode) {
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

export function checkSameDiagonal() {
	if (!arguments.length)
		return;

	let arr = Array.from(arguments)
	let res = []

	let acwArr = arr.map(arg => getLowerDiagonalBounds(arg, "acw"))
	let cwArr = arr.map(arg => getLowerDiagonalBounds(arg, "cw"))

	res.push(acwArr.every(pos => pos.x === acwArr[0].x && pos.y === acwArr[0].y))
	res.push(cwArr.every(pos => pos.x === cwArr[0].x && pos.y === cwArr[0].y))

	return res[0] || res[1]
}