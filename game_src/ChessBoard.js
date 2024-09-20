import { defaultBoard, CHESS_COLOR, CHESS_PIECE_BLACK } from "./ChessVariables.js";
import { ChessPiece } from "./ChessPiece.js";
import { getDirection, objIncludes } from "./util.js";

export class ChessBoard {
	constructor() {
		this.positions = [[], [], [], [], [], [], [], []];
		this.pieces = {
			[CHESS_COLOR.WHITE]: [],
			[CHESS_COLOR.BLACK]: []
		};
		this.attackedSquares = {
			[CHESS_COLOR.WHITE]: {},
			[CHESS_COLOR.BLACK]: {}
		}
		this.allowedMoves = {
			[CHESS_COLOR.WHITE]: [],
			[CHESS_COLOR.BLACK]: []
		}
		this.currentTurn = ""

		this.check = false;
		this.checked = null;
		this.checkers = [];

		this.checkmate = false;
		this.checkmated = null;

		this.stalemate = false;
		this.stalemated = null;
	}

	async init() {
		for (let i = 0; i != 8; i++) {
			for (let j = 0; j != 8; j++) {
				let curPiece = defaultBoard[i][j];
				this.positions[i].push(curPiece);

				if (curPiece) {
					if (objIncludes(CHESS_PIECE_BLACK, curPiece)) {
						this.pieces[CHESS_COLOR.BLACK].push(new ChessPiece(this, CHESS_COLOR.BLACK, curPiece, { x: j, y: i }));
						this.attackedSquares[CHESS_COLOR.BLACK][curPiece] = []
					}
					else {
						this.pieces[CHESS_COLOR.WHITE].push(new ChessPiece(this, CHESS_COLOR.WHITE, curPiece, { x: j, y: i }));
						this.attackedSquares[CHESS_COLOR.WHITE][curPiece] = []
					}
				}
			}
		}

		this.currentTurn = CHESS_COLOR.WHITE

		this.updateAttackedSquares()
	}

	getPieceOnPosition(pos) {
		let res = this.pieces[CHESS_COLOR.BLACK].concat(this.pieces[CHESS_COLOR.WHITE]).filter((piece) => {
			return piece.position.x === pos.x && piece.position.y === pos.y
		});

		if (res.length)
			return res[0];

		return null;
	}

	getAttackerOnPosition(pos) {
		let squares = []

		for (let arr of Object.values(this.attackedSquares[this.currentTurn === CHESS_COLOR.BLACK ? CHESS_COLOR.WHITE : CHESS_COLOR.BLACK])) {
			squares = squares.concat(arr)
		}

		let res = squares.filter(move => {
			return move.x === pos.x && move.y === pos.y && move.isAttackableMove
		})

		if (res.length)
			return res[0].attackingPiece;

		return null;
	}

	move(piece, newPos) {
		// Logical position
		this.positions[piece.position.y][piece.position.x] = "";
		this.positions[newPos.y][newPos.x] = piece.type;

		// EN PASSANT
		if (piece.isPawn() && piece.pawnInitialMove) {
			piece.pawnInitialMove = false;

			if (Math.abs(newPos.y - piece.position.y) === 2) {
				let otherPiece = null;

				if (newPos.x - 1 >= 0)
					otherPiece = this.getPieceOnPosition({ x: newPos.x - 1, y: newPos.y })

				if (newPos.x + 1 < 8)
					otherPiece = this.getPieceOnPosition({ x: newPos.x + 1, y: newPos.y })

				if (otherPiece && otherPiece.color != piece.color)
					piece.canEnPassant = true;
			}
		}

		if (this.check) {
			this.check = false;
			this.checkers = [];
			this.checked = null;

			this.allowedMoves = {
				[CHESS_COLOR.WHITE]: [],
				[CHESS_COLOR.BLACK]: []
			}
		}

		piece.position.x = newPos.x;
		piece.position.y = newPos.y;

		if (this.currentTurn === CHESS_COLOR.WHITE)
			this.currentTurn = CHESS_COLOR.BLACK
		else
			this.currentTurn = CHESS_COLOR.WHITE

		this.updateAttackedSquares()
		this.postMove()
	}

	kill(piece, newPos, targetPiece) {

		let targetPieceIndex = 0;

		this.positions[targetPiece.position.y][targetPiece.position.x] = ""

		this.pieces[targetPiece.color].map((e, i) => {
			if (e.position.x === targetPiece.position.x && e.position.y === targetPiece.position.y) {
				targetPieceIndex = i
			}
		})

		this.pieces[targetPiece.color].splice(targetPieceIndex, 1)

		this.attackedSquares[targetPiece.color][targetPiece.type] = []

		return this.move(piece, newPos)
	}

	updateAttackedSquares() {
		// clear attacked squares
		for (let piece of this.pieces[CHESS_COLOR.BLACK].concat(this.pieces[CHESS_COLOR.WHITE])) {
			this.attackedSquares[piece.color][piece.type] = []
		}

		// update attacked squares
		for (let piece of this.pieces[CHESS_COLOR.BLACK].concat(this.pieces[CHESS_COLOR.WHITE])) {
			let attackedSquares = piece.getMovablePositions()
			for (let [index, value] of Object.entries(attackedSquares)) {
				if (piece.isPawn()) {
					if (!value["isAttackableMove"] || !value["isPawnDiagonal"]) continue;
				}

				value["attackingPiece"] = piece;
				attackedSquares[index] = value

				if (value["isKillingMove"] && value["killTarget"].isKing()) {
					this.check = true;
					this.checkers.push(piece);
					this.checked = value["killTarget"]
				}
			}
			this.attackedSquares[piece.color][piece.type] = this.attackedSquares[piece.color][piece.type].concat(attackedSquares);
		}
	}

	// never meant to be called from outside the class
	postMove() {
		if (this.checkers.length === 1) {
			let king = this.checked;
			let checker = this.checkers[0]

			let dir = getDirection(king.position, checker.position)

			if (!checker.isKnight()) {
				for (
					let i = king.position.x, j = king.position.y;

					i != checker.position.x || j != checker.position.y;

					king.position.x != checker.position.x
						? (dir.x > 0 ? i++ : i--)
						: null,
					king.position.y != checker.position.y
						? (dir.y > 0 ? j++ : j--)
						: null
				) {
					// Memory leak
					if (i >= 10 || j >= 10) {
						console.warn("[ChessBoard] Memory leak detected in updateAttackedSquares()! ")
						break;
					}

					if (i === king.position.x && j === king.position.y)
						continue;

					this.allowedMoves[king.color].push({ x: i, y: j })
				}
			}
			this.allowedMoves[king.color].push({ x: checker.position.x, y: checker.position.y })
		}

		if (this.check && this.checkers.length) {
			let allowedMoves = this.allowedMoves[this.checked.color]
			let availableMoves = []
			let movePossible = this.checked.moves.filter(move => !move.isFriendlyPiece);

			for (let piece of Object.values(this.pieces[this.checked.color])) {
				availableMoves = availableMoves.concat(piece.moves)
			}

			for (let move of availableMoves) {
				if (movePossible.length)
					break;

				movePossible = allowedMoves.filter(e => { e.x === move.x && e.y === move.y })
			}

			if (!movePossible.length) {
				this.checkmate = true;
				this.checkmated = this.checked
			}
		}
	}
}
