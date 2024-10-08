import { CHESS_PIECE_BLACK, CHESS_PIECE_WHITE, CHESS_MOVE_TYPE, CHESS_COLOR } from "./ChessVariables.js";
import { createEnPassantMove, createFriendlyMove, createKillingMove, createMove, createPawnDiagonalMove, createPawnMove, createPawnDiagonalKillingMove, checkSameDiagonal, createPawnPromotingMove, createCastlingMove } from "./util.js";

export class ChessPiece {
	constructor(board, color, type, pos) {
		this.board = board;
		this.color = color;
		this.type = type;
		this.position = { x: pos.x, y: pos.y };
		this.moves = []

		this.isPinned = false;
		this.pinner = null

		if (this.isPawn()) {
			this.pawnInitialMove = true;
			this.canEnPassant = false;
		}

		if (this.isRook() || this.isKing()) {
			this.hasMoved = false;
		}

		this.moveType = CHESS_MOVE_TYPE.DEFAULT;
		this.setupMoveType();
	}

	setupMoveType() {
		if (this.isRook())
			this.moveType = CHESS_MOVE_TYPE.STRAIGHT;

		if (this.isBishop())
			this.moveType = CHESS_MOVE_TYPE.DIAGONAL;

		if (this.isKnight())
			this.moveType = CHESS_MOVE_TYPE.KNIGHT;

		if (this.isKing())
			this.moveType = CHESS_MOVE_TYPE.KING;

		if (this.isPawn())
			this.moveType = CHESS_MOVE_TYPE.PAWN;

		if (this.isQueen())
			this.moveType = CHESS_MOVE_TYPE.STRAIGHT | CHESS_MOVE_TYPE.DIAGONAL;
	}

	isRook() {
		return [CHESS_PIECE_BLACK.ROOK, CHESS_PIECE_WHITE.ROOK].includes(this.type);
	}

	isKnight() {
		return [CHESS_PIECE_BLACK.KNIGHT, CHESS_PIECE_WHITE.KNIGHT].includes(this.type);
	}

	isBishop() {
		return [CHESS_PIECE_BLACK.BISHOP, CHESS_PIECE_WHITE.BISHOP].includes(this.type);
	}

	isQueen() {
		return [CHESS_PIECE_BLACK.QUEEN, CHESS_PIECE_WHITE.QUEEN].includes(this.type);
	}

	isKing() {
		return [CHESS_PIECE_BLACK.KING, CHESS_PIECE_WHITE.KING].includes(this.type);
	}

	isPawn() {
		return [CHESS_PIECE_BLACK.PAWN, CHESS_PIECE_WHITE.PAWN].includes(this.type);
	}

	getEnemyColor() {
		return this.color === CHESS_COLOR.BLACK ? CHESS_COLOR.WHITE : CHESS_COLOR.BLACK;
	}

	getKing() {
		return this.board.pieces[this.color].filter(piece => piece.type === (this.color === CHESS_COLOR.BLACK ? CHESS_PIECE_BLACK.KING : CHESS_PIECE_WHITE.KING))[0]
	}

	promote(newPiece) {
		if (!this.isPawn())
			return;

		delete this["pawnInitialMove"];
		delete this["canEnPassant"];

		this.type = newPiece;
		this.setupMoveType();
		this.getMovablePositions()
	}

	castle(targetRook) {
		if (!this.isKing())
			return;

		if (targetRook.position.x < this.position.x) {
			// queenside castling
			this.board.move(this, { x: this.position.x - 2, y: this.position.y })
			this.board.move(targetRook, { x: this.position.x + 1, y: this.position.y })
		} else {
			// kingside castling
			this.board.move(this, { x: this.position.x + 2, y: this.position.y })
			this.board.move(targetRook, { x: this.position.x - 1, y: this.position.y })
		}
	}

	getMovablePositions() {
		this.moves = [];
		let curPos = this.position;
		let blockingPiece = null;
		let isBlocked = false;

		if (this.moveType & CHESS_MOVE_TYPE.PAWN) {
			let y = this.color === CHESS_COLOR.BLACK ? curPos.y + 1 : curPos.y - 1;
			let pawnNumPos = this.pawnInitialMove ? 2 : 1;

			for (let i = -1; i <= 1; i++) {
				if (i === 0) continue;

				let x = curPos.x + i;

				if ((i === -1 && x < 0) || (i === 1 && x > 7)) continue;

				if (this.board.check && this.board.check.color === this.color && !this.board.allowedMoves[this.color].length)
					return [];

				if (this.board.check && this.board.check.color === this.color && this.board.allowedMoves[this.color].length) {
					let move = this.board.allowedMoves[this.color].some(e => e.x === x && e.y === y)
					if (!move)
						continue
				}

				if (this.isPinned) {
					if (!checkSameDiagonal(this.pinner.position, this.position, this.getKing().position, { x, y }))
						continue
				}

				// Pawns can kill diagonally
				let piece = this.board.getPieceOnPosition({ x, y });
				if (piece && piece.color != this.color) createPawnDiagonalKillingMove(this, x, y, piece)
				else {
					// Check for En Passant
					piece = this.board.getPieceOnPosition({ x, y: curPos.y })

					if (piece && piece.color != this.color && piece.canEnPassant)
						createEnPassantMove(this, x, y, piece)
					else
						createPawnDiagonalMove(this, x, y)
				}
			}

			for (let i = curPos.y;
				this.color === CHESS_COLOR.BLACK ?
					(i <= curPos.y + pawnNumPos && (curPos.y + pawnNumPos) <= 7) :
					(i >= curPos.y - pawnNumPos && (curPos.y - pawnNumPos) >= 0);
				this.color === CHESS_COLOR.BLACK ?
					i++ :
					i--) {
				// ignore self
				if (curPos.y == i) continue;

				if (this.board.check && this.board.check.color === this.color && !this.board.allowedMoves[this.color].length)
					return [];

				let blockingPiece = this.board.getPieceOnPosition({ x: curPos.x, y: i })
				if (blockingPiece)
					break;

				if (this.board.check && this.board.check.color === this.color && this.board.allowedMoves[this.color].length) {
					let move = this.board.allowedMoves[this.color].some(e => e.x === curPos.x && e.y === i)
					if (!move)
						continue
				}

				if (this.isPinned) {
					let king = this.board.pieces[this.color].filter(piece => piece.isKing())[0]
					let attacker = this.pinner;

					if (
						(king.position.x != attacker.position.x || king.position.x != this.position.x || king.position.x != curPos.x) &&
						(king.position.y != attacker.position.y || king.position.y != this.position.y || king.position.y != i)
					) continue;
				}

				if (i === 0 || 8 - i === 0)
					createPawnPromotingMove(this, curPos.x, i)
				else
					createPawnMove(this, curPos.x, i)
			}
		}

		if (this.moveType & CHESS_MOVE_TYPE.STRAIGHT) {
			// Left
			for (let i = curPos.x; i >= 0; i--) {
				// ignore self
				if (curPos.x == i) continue;

				if (this.board.check && this.board.check.color === this.color && !this.board.allowedMoves[this.color].length)
					return [];

				if (!blockingPiece) blockingPiece = this.board.getPieceOnPosition({ x: i, y: curPos.y })

				if (this.board.check && this.board.check.color === this.color && this.board.allowedMoves[this.color].length) {
					if (blockingPiece && blockingPiece.color === this.color) {
						createFriendlyMove(this, i, curPos.y)
						break;
					}

					let move = this.board.allowedMoves[this.color].some(e => e.x === i && e.y === curPos.y)
					if (!move)
						continue
				}

				if (this.isPinned) {
					let king = this.board.pieces[this.color].filter(piece => piece.isKing())[0]
					let attacker = this.pinner;

					if (
						(king.position.x != attacker.position.x || king.position.x != this.position.x || king.position.x != i) &&
						(king.position.y != attacker.position.y || king.position.y != this.position.y || king.position.y != curPos.y)
					) continue;
				}

				if (blockingPiece) {
					if (!isBlocked) {
						if (blockingPiece.color != this.color) {
							createKillingMove(this, i, curPos.y, blockingPiece)
							if (!blockingPiece.isKing()) isBlocked = true;
						}
						else {
							createFriendlyMove(this, i, curPos.y)
							isBlocked = true;
						}
					} else {
						let beyondBlockedPiece = this.board.getPieceOnPosition({ x: i, y: curPos.y })
						if (beyondBlockedPiece && beyondBlockedPiece.isKing() && beyondBlockedPiece.color != this.color) {
							blockingPiece.isPinned = true
							blockingPiece.pinner = this;
							if (!this.board.pinnedPieces.filter(piece => piece.x === blockingPiece.x && piece.y === blockingPiece.y).length)
								this.board.pinnedPieces.push(blockingPiece)
						}
					}
				} else createMove(this, i, curPos.y);
			}

			isBlocked = false;
			blockingPiece = null;

			// Right
			for (let i = curPos.x; i <= 7; i++) {
				// ignore self
				if (curPos.x == i) continue;

				if (this.board.check && this.board.check.color === this.color && !this.board.allowedMoves[this.color].length)
					return [];

				if (!blockingPiece) blockingPiece = this.board.getPieceOnPosition({ x: i, y: curPos.y })

				if (this.board.check && this.board.check.color === this.color && this.board.allowedMoves[this.color].length) {
					if (blockingPiece && blockingPiece.color === this.color) {
						createFriendlyMove(this, i, curPos.y)
						break;
					}

					let move = this.board.allowedMoves[this.color].some(e => e.x === i && e.y === curPos.y)
					if (!move)
						continue
				}
				if (this.isPinned) {
					let king = this.board.pieces[this.color].filter(piece => piece.isKing())[0]
					let attacker = this.pinner;

					if (
						(king.position.x != attacker.position.x || king.position.x != this.position.x || king.position.x != i) &&
						(king.position.y != attacker.position.y || king.position.y != this.position.y || king.position.y != curPos.y)
					) continue;
				}

				if (blockingPiece) {
					if (!isBlocked) {
						if (blockingPiece.color != this.color) {
							createKillingMove(this, i, curPos.y, blockingPiece)
							if (!blockingPiece.isKing()) isBlocked = true;
						}
						else {
							createFriendlyMove(this, i, curPos.y)
							isBlocked = true;
						}
					} else {
						let beyondBlockedPiece = this.board.getPieceOnPosition({ x: i, y: curPos.y })
						if (beyondBlockedPiece && beyondBlockedPiece.isKing() && beyondBlockedPiece.color != this.color) {
							blockingPiece.isPinned = true
							blockingPiece.pinner = this;
							if (!this.board.pinnedPieces.filter(piece => piece.x === blockingPiece.x && piece.y === blockingPiece.y).length)
								this.board.pinnedPieces.push(blockingPiece)
						}
					}
				} else createMove(this, i, curPos.y);
			}

			isBlocked = false;
			blockingPiece = null;

			// Top
			for (let i = curPos.y; i >= 0; i--) {
				// ignore self
				if (curPos.y == i) continue;

				if (this.board.check && this.board.check.color === this.color && !this.board.allowedMoves[this.color].length)
					return [];

				if (!blockingPiece) blockingPiece = this.board.getPieceOnPosition({ x: curPos.x, y: i })

				if (this.board.check && this.board.check.color === this.color && this.board.allowedMoves[this.color].length) {
					if (blockingPiece && blockingPiece.color === this.color) {
						createFriendlyMove(this, i, curPos.y)
						break;
					}

					let move = this.board.allowedMoves[this.color].some(e => e.x === curPos.x && e.y === i)
					if (!move)
						continue
				}

				if (this.isPinned) {
					let king = this.board.pieces[this.color].filter(piece => piece.isKing())[0]
					let attacker = this.pinner;

					if (
						(king.position.x != attacker.position.x || king.position.x != this.position.x || king.position.x != curPos.x) &&
						(king.position.y != attacker.position.y || king.position.y != this.position.y || king.position.y != i)
					) continue;
				}

				if (blockingPiece) {
					if (!isBlocked) {
						if (blockingPiece.color != this.color) {
							createKillingMove(this, curPos.x, i, blockingPiece)
							if (!blockingPiece.isKing()) isBlocked = true;
						}
						else {
							createFriendlyMove(this, curPos.x, i)
							isBlocked = true;
						}
					} else {
						let beyondBlockedPiece = this.board.getPieceOnPosition({ x: curPos.x, y: i })
						if (beyondBlockedPiece && beyondBlockedPiece.isKing() && beyondBlockedPiece.color != this.color) {
							blockingPiece.isPinned = true
							blockingPiece.pinner = this;
							if (!this.board.pinnedPieces.filter(piece => piece.x === blockingPiece.x && piece.y === blockingPiece.y).length)
								this.board.pinnedPieces.push(blockingPiece)
						}
					}
				} else createMove(this, curPos.x, i);
			}

			isBlocked = false;
			blockingPiece = null;

			// Bottom
			for (let i = curPos.y; i <= 7; i++) {
				// ignore self
				if (curPos.y == i) continue;

				if (this.board.check && this.board.check.color === this.color && !this.board.allowedMoves[this.color].length)
					return [];

				if (!blockingPiece) blockingPiece = this.board.getPieceOnPosition({ x: curPos.x, y: i })

				if (this.board.check && this.board.check.color === this.color && this.board.allowedMoves[this.color].length) {
					if (blockingPiece && blockingPiece.color === this.color) {
						createFriendlyMove(this, i, curPos.y)
						break;
					}

					let move = this.board.allowedMoves[this.color].some(e => e.x === curPos.x && e.y === i)
					if (!move)
						continue
				}

				if (this.isPinned) {
					let king = this.board.pieces[this.color].filter(piece => piece.isKing())[0]
					let attacker = this.pinner;

					if (
						(king.position.x != attacker.position.x || king.position.x != this.position.x || king.position.x != curPos.x) &&
						(king.position.y != attacker.position.y || king.position.y != this.position.y || king.position.y != i)
					) continue;
				}

				if (blockingPiece) {
					if (!isBlocked) {
						if (blockingPiece.color != this.color) {
							createKillingMove(this, curPos.x, i, blockingPiece)
							if (!blockingPiece.isKing()) isBlocked = true;
						}
						else {
							createFriendlyMove(this, curPos.x, i)
							isBlocked = true;
						}
					} else {
						let beyondBlockedPiece = this.board.getPieceOnPosition({ x: curPos.x, y: i })
						if (beyondBlockedPiece && beyondBlockedPiece.isKing() && beyondBlockedPiece.color != this.color) {
							blockingPiece.isPinned = true
							blockingPiece.pinner = this;
							if (!this.board.pinnedPieces.filter(piece => piece.x === blockingPiece.x && piece.y === blockingPiece.y).length)
								this.board.pinnedPieces.push(blockingPiece)
						}
					}
				} else createMove(this, curPos.x, i);
			}

			isBlocked = false;
			blockingPiece = null;
		}

		if (this.moveType & CHESS_MOVE_TYPE.DIAGONAL) {
			// Top left
			for (let i = curPos.x, j = curPos.y; i >= 0 && j >= 0; i--, j--) {
				// ignore self
				if (curPos.x == i && curPos.y == j) continue;

				if (this.board.check && this.board.check.color === this.color && !this.board.allowedMoves[this.color].length)
					return [];

				if (!blockingPiece) blockingPiece = this.board.getPieceOnPosition({ x: i, y: j })

				if (this.board.check && this.board.check.color === this.color && this.board.allowedMoves[this.color].length) {
					if (blockingPiece && blockingPiece.color === this.color) {
						createFriendlyMove(this, i, j)
						break;
					}

					let move = this.board.allowedMoves[this.color].some(e => e.x === i && e.y === j)
					if (!move)
						continue
				}

				if (this.isPinned) {
					if (!checkSameDiagonal(this.pinner.position, this.position, this.getKing().position, { x: i, y: j }))
						continue
				}

				if (blockingPiece) {
					if (!isBlocked) {
						if (blockingPiece.color != this.color) {
							createKillingMove(this, i, j, blockingPiece)
							if (!blockingPiece.isKing()) isBlocked = true;
						}
						else {
							createFriendlyMove(this, i, j)
							isBlocked = true;
						}
					} else {
						let beyondBlockedPiece = this.board.getPieceOnPosition({ x: i, y: j })
						if (beyondBlockedPiece && beyondBlockedPiece.isKing() && beyondBlockedPiece.color != this.color) {
							blockingPiece.isPinned = true
							blockingPiece.pinner = this;
							if (!this.board.pinnedPieces.filter(piece => piece.x === blockingPiece.x && piece.y === blockingPiece.y).length)
								this.board.pinnedPieces.push(blockingPiece)
						}
					}
				} else createMove(this, i, j);
			}

			isBlocked = false;
			blockingPiece = null;

			// Top right
			for (let i = curPos.x, j = curPos.y; i <= 7 && j >= 0; i++, j--) {
				// ignore self
				if (curPos.x == i && curPos.y == j) continue;

				if (this.board.check && this.board.check.color === this.color && !this.board.allowedMoves[this.color].length)
					return [];

				if (!blockingPiece) blockingPiece = this.board.getPieceOnPosition({ x: i, y: j })

				if (this.board.check && this.board.check.color === this.color && this.board.allowedMoves[this.color].length) {
					if (blockingPiece && blockingPiece.color === this.color) {
						createFriendlyMove(this, i, j)
						break;
					}

					let move = this.board.allowedMoves[this.color].some(e => e.x === i && e.y === j)
					if (!move)
						continue
				}

				if (this.isPinned) {
					if (!checkSameDiagonal(this.pinner.position, this.position, this.getKing().position, { x: i, y: j }))
						continue
				}

				if (blockingPiece) {
					if (!isBlocked) {
						if (blockingPiece.color != this.color) {
							createKillingMove(this, i, j, blockingPiece)
							if (!blockingPiece.isKing()) isBlocked = true;
						}
						else {
							createFriendlyMove(this, i, j)
							isBlocked = true;
						}
					} else {
						let beyondBlockedPiece = this.board.getPieceOnPosition({ x: i, y: j })
						if (beyondBlockedPiece && beyondBlockedPiece.isKing() && beyondBlockedPiece.color != this.color) {
							blockingPiece.isPinned = true
							blockingPiece.pinner = this;
							if (!this.board.pinnedPieces.filter(piece => piece.x === blockingPiece.x && piece.y === blockingPiece.y).length)
								this.board.pinnedPieces.push(blockingPiece)
						}
					}
				} else createMove(this, i, j);
			}

			isBlocked = false;
			blockingPiece = null;

			// Bottom left
			for (let i = curPos.x, j = curPos.y; i >= 0 && j <= 7; i--, j++) {
				// ignore self
				if (curPos.x == i && curPos.y == j) continue;

				if (this.board.check && this.board.check.color === this.color && !this.board.allowedMoves[this.color].length)
					return [];

				if (!blockingPiece) blockingPiece = this.board.getPieceOnPosition({ x: i, y: j })

				if (this.board.check && this.board.check.color === this.color && this.board.allowedMoves[this.color].length) {
					if (blockingPiece && blockingPiece.color === this.color) {
						createFriendlyMove(this, i, j)
						break;
					}

					let move = this.board.allowedMoves[this.color].some(e => e.x === i && e.y === j)
					if (!move)
						continue
				}

				if (this.isPinned) {
					if (!checkSameDiagonal(this.pinner.position, this.position, this.getKing().position, { x: i, y: j }))
						continue
				}

				if (blockingPiece) {
					if (!isBlocked) {
						if (blockingPiece.color != this.color) {
							createKillingMove(this, i, j, blockingPiece)
							if (!blockingPiece.isKing()) isBlocked = true;
						}
						else {
							createFriendlyMove(this, i, j)
							isBlocked = true;
						}
					} else {
						let beyondBlockedPiece = this.board.getPieceOnPosition({ x: i, y: j })
						if (beyondBlockedPiece && beyondBlockedPiece.isKing() && beyondBlockedPiece.color != this.color) {
							blockingPiece.isPinned = true
							blockingPiece.pinner = this;
							if (!this.board.pinnedPieces.filter(piece => piece.x === blockingPiece.x && piece.y === blockingPiece.y).length)
								this.board.pinnedPieces.push(blockingPiece)
						}
					}
				} else createMove(this, i, j);
			}

			isBlocked = false;
			blockingPiece = null;

			// Bottom right
			for (let i = curPos.x, j = curPos.y; i <= 7 && j <= 7; i++, j++) {
				// ignore self
				if (curPos.x == i && curPos.y == j) continue;

				if (this.board.check && this.board.check.color === this.color && !this.board.allowedMoves[this.color].length)
					return [];

				if (!blockingPiece) blockingPiece = this.board.getPieceOnPosition({ x: i, y: j })

				if (this.board.check && this.board.check.color === this.color && this.board.allowedMoves[this.color].length) {
					if (blockingPiece && blockingPiece.color === this.color) {
						createFriendlyMove(this, i, j)
						break;
					}

					let move = this.board.allowedMoves[this.color].some(e => e.x === i && e.y === j)
					if (!move)
						continue
				}

				if (this.isPinned) {
					if (!checkSameDiagonal(this.pinner.position, this.position, this.getKing().position, { x: i, y: j }))
						continue
				}

				if (blockingPiece) {
					if (!isBlocked) {
						if (blockingPiece.color != this.color) {
							createKillingMove(this, i, j, blockingPiece)
							if (!blockingPiece.isKing()) isBlocked = true;
						}
						else {
							createFriendlyMove(this, i, j)
							isBlocked = true;
						}
					} else {
						let beyondBlockedPiece = this.board.getPieceOnPosition({ x: i, y: j })
						if (beyondBlockedPiece && beyondBlockedPiece.isKing() && beyondBlockedPiece.color != this.color) {
							blockingPiece.isPinned = true
							blockingPiece.pinner = this;
							if (!this.board.pinnedPieces.filter(piece => piece.x === blockingPiece.x && piece.y === blockingPiece.y).length)
								this.board.pinnedPieces.push(blockingPiece)
						}
					}
				} else createMove(this, i, j);
			}

			isBlocked = false;
			blockingPiece = null;
		}

		if (this.moveType & CHESS_MOVE_TYPE.KING) {
			for (let xOffset = -1; xOffset <= 1; xOffset++) {
				for (let yOffset = -1; yOffset <= 1; yOffset++) {
					if (xOffset === 0 && yOffset === 0) continue;

					if (curPos.x + xOffset >= 0 && curPos.x + xOffset <= 7 && curPos.y + yOffset >= 0 && curPos.y + yOffset <= 7) {
						let blockingPiece = this.board.getPieceOnPosition({ x: curPos.x + xOffset, y: curPos.y + yOffset })
						let attackingPiece = this.board.getAttackerOnPosition({ x: curPos.x + xOffset, y: curPos.y + yOffset })

						if (attackingPiece && attackingPiece != this.color) continue;

						if (blockingPiece) {
							if (blockingPiece.color != this.color)
								createKillingMove(this, curPos.x + xOffset, curPos.y + yOffset, blockingPiece)
							else
								createFriendlyMove(this, curPos.x + xOffset, curPos.y + yOffset)
						} else {
							if (!attackingPiece || attackingPiece.color === this.color)
								createMove(this, curPos.x + xOffset, curPos.y + yOffset);
						}
					}
				}
			}

			if (!this.hasMoved && !this.check) {
				// Check for queenside castling (O-O-O) (Left)
				for (let i = curPos.x; i >= 0; i--) {
					// ignore self
					if (i === curPos.x)
						continue;

					let blockingPiece = this.board.getPieceOnPosition({ x: i, y: curPos.y })

					if (!blockingPiece) {
						let attackingPiece = this.board.getAttackerOnPosition({ x: i, y: curPos.y })

						if (attackingPiece && attackingPiece.color !== this.color && curPos.x - i <= 2) {
							break;
						}
					} else {
						if (!blockingPiece.isRook())
							break;

						if (!blockingPiece.hasMoved)
							createCastlingMove(this, curPos.x - 2, curPos.y, blockingPiece)
					}
				}

				// Check for kingside castling (O-O) (Right)
				for (let i = curPos.x; i <= 7; i++) {
					// ignore self
					if (i === curPos.x)
						continue;
					let blockingPiece = this.board.getPieceOnPosition({ x: i, y: curPos.y })

					if (!blockingPiece) {
						let attackingPiece = this.board.getAttackerOnPosition({ x: i, y: curPos.y })

						if (attackingPiece && attackingPiece.color !== this.color && curPos.x - i <= 2) {
							break;
						}
					} else {
						if (!blockingPiece.isRook())
							break;

						if (!blockingPiece.hasMoved)
							createCastlingMove(this, curPos.x + 2, curPos.y, blockingPiece)
					}
				}
			}
		}

		if (this.moveType & CHESS_MOVE_TYPE.KNIGHT) {
			// top
			if (curPos.y - 2 >= 0) {
				if (curPos.x - 1 >= 0) {
					let move = true;
					if (this.board.check && this.board.check.color === this.color) {
						if (!this.board.allowedMoves[this.color].length)
							return [];

						move = this.board.allowedMoves[this.color].some(e => e.x === curPos.x - 1 && e.y === curPos.y - 2)
					}

					if (move) {
						let otherPiece = this.board.getPieceOnPosition({ x: curPos.x - 1, y: curPos.y - 2 })
						if (otherPiece) {
							if (otherPiece.color != this.color)
								createKillingMove(this, curPos.x - 1, curPos.y - 2, otherPiece)
							else
								createFriendlyMove(this, curPos.x - 1, curPos.y - 2)
						}
						else
							createMove(this, curPos.x - 1, curPos.y - 2);
					}
				}

				if (curPos.x + 1 <= 7) {
					let move = true;
					if (this.board.check && this.board.check.color === this.color) {
						if (!this.board.allowedMoves[this.color].length)
							return [];

						move = this.board.allowedMoves[this.color].some(e => e.x === curPos.x + 1 && e.y === curPos.y - 2)
					}

					if (move) {
						let otherPiece = this.board.getPieceOnPosition({ x: curPos.x + 1, y: curPos.y - 2 })
						if (otherPiece) {
							if (otherPiece.color != this.color)
								createKillingMove(this, curPos.x + 1, curPos.y - 2, otherPiece)
							else
								createFriendlyMove(this, curPos.x + 1, curPos.y - 2)
						}
						else
							createMove(this, curPos.x + 1, curPos.y - 2);
					}
				}
			}

			// bottom
			if (curPos.y + 2 <= 7) {
				if (curPos.x - 1 >= 0) {
					let move = true;
					if (this.board.check && this.board.check.color === this.color) {
						if (!this.board.allowedMoves[this.color].length)
							return [];

						move = this.board.allowedMoves[this.color].some(e => e.x === curPos.x - 1 && e.y === curPos.y + 2)
					}

					if (move) {
						let otherPiece = this.board.getPieceOnPosition({ x: curPos.x - 1, y: curPos.y + 2 });
						if (otherPiece) {
							if (otherPiece.color != this.color)
								createKillingMove(this, curPos.x - 1, curPos.y + 2, otherPiece)
							else
								createFriendlyMove(this, curPos.x - 1, curPos.y + 2)
						}
						else
							createMove(this, curPos.x - 1, curPos.y + 2);
					}
				}


				if (curPos.x + 1 <= 7) {
					let move = true;
					if (this.board.check && this.board.check.color === this.color) {
						if (!this.board.allowedMoves[this.color].length)
							return [];

						move = this.board.allowedMoves[this.color].some(e => e.x === curPos.x + 1 && e.y === curPos.y + 2)
					}

					if (move) {
						let otherPiece = this.board.getPieceOnPosition({ x: curPos.x + 1, y: curPos.y + 2 });
						if (otherPiece) {
							if (otherPiece.color != this.color)
								createKillingMove(this, curPos.x + 1, curPos.y + 2, otherPiece)
							else
								createFriendlyMove(this, curPos.x + 1, curPos.y + 2)
						}
						else
							createMove(this, curPos.x + 1, curPos.y + 2);
					}
				}
			}

			// left
			if (curPos.x - 2 >= 0) {
				if (curPos.y - 1 >= 0) {
					let move = true;
					if (this.board.check && this.board.check.color === this.color) {
						if (!this.board.allowedMoves[this.color].length)
							return [];

						move = this.board.allowedMoves[this.color].some(e => e.x === curPos.x - 2 && e.y === curPos.y - 1)
					}

					if (move) {
						let otherPiece = this.board.getPieceOnPosition({ x: curPos.x - 2, y: curPos.y - 1 })
						if (otherPiece) {
							if (otherPiece.color != this.color)
								createKillingMove(this, curPos.x - 2, curPos.y - 1, otherPiece)
							else
								createFriendlyMove(this, curPos.x - 2, curPos.y - 1)
						}
						else
							createMove(this, curPos.x - 2, curPos.y - 1);
					}
				}

				if (curPos.y + 1 <= 7) {
					let move = true;
					if (this.board.check && this.board.check.color === this.color) {
						if (!this.board.allowedMoves[this.color].length)
							return [];

						move = this.board.allowedMoves[this.color].some(e => e.x === curPos.x - 2 && e.y === curPos.y + 1)
					}

					if (move) {
						let otherPiece = this.board.getPieceOnPosition({ x: curPos.x - 2, y: curPos.y + 1 })
						if (otherPiece) {
							if (otherPiece.color != this.color)
								createKillingMove(this, curPos.x - 2, curPos.y + 1, otherPiece)
							else
								createFriendlyMove(this, curPos.x - 2, curPos.y + 1)
						}
						else
							createMove(this, curPos.x - 2, curPos.y + 1);
					}
				}
			}

			// right
			if (curPos.x + 2 <= 7) {
				if (curPos.y - 1 >= 0) {
					let move = true;
					if (this.board.check && this.board.check.color === this.color) {
						if (!this.board.allowedMoves[this.color].length)
							return [];

						move = this.board.allowedMoves[this.color].some(e => e.x === curPos.x + 2 && e.y === curPos.y - 1)
					}

					if (move) {
						let otherPiece = this.board.getPieceOnPosition({ x: curPos.x + 2, y: curPos.y - 1 })
						if (otherPiece) {
							if (otherPiece.color != this.color)
								createKillingMove(this, curPos.x + 2, curPos.y - 1, otherPiece)
							else
								createFriendlyMove(this, curPos.x + 2, curPos.y - 1)
						}
						else
							createMove(this, curPos.x + 2, curPos.y - 1);
					}
				}


				if (curPos.y + 1 <= 7) {

					let move = true;
					if (this.board.check && this.board.check.color === this.color) {
						if (!this.board.allowedMoves[this.color].length)
							return [];

						move = this.board.allowedMoves[this.color].some(e => e.x === curPos.x + 2 && e.y === curPos.y + 1)
					}


					if (move) {
						let otherPiece = this.board.getPieceOnPosition({ x: curPos.x + 2, y: curPos.y + 1 })
						if (otherPiece) {
							if (otherPiece.color != this.color)
								createKillingMove(this, curPos.x + 2, curPos.y + 1, otherPiece)
							else
								createFriendlyMove(this, curPos.x + 2, curPos.y + 1)
						}
						else
							createMove(this, curPos.x + 2, curPos.y + 1);
					}

				}
			}
		}

		return this.moves;
	}
}