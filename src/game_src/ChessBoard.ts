import { defaultBoard, CHESS_COLOR, CHESS_PIECE_BLACK, CHESS_MOVE_RESPONSES, CHESS_PIECE } from "./ChessVariables.js";
import { TChessMove, TChessPosition } from "../types/ChessTypes.js";
import { getChessPieceKey, getDirection, objIncludes } from "./util.js";
import { ChessPiece } from "./ChessPiece.js";

export class ChessBoard {
	/**** Properties ****/

	// An object that stores "attacked squares" of each piece for each color.
	// "Attacked Squares" are basically the squares a piece can potentially move to,
	// making it dangerous for enemies to move to.
	private _attackedSquares: { [key in CHESS_COLOR]: { [piece in CHESS_PIECE]?: TChessMove[] } };

	// An object that stores an array containing ONLY squares ANY of **one's colored pieces can move to** for each color (player), this limit is usually enforced on checks
	private _allowedMoves: { [key in CHESS_COLOR]: TChessPosition[] };

	// An object storing ChessPiece object references of each color (player)
	// **Note**: This is **not in any way** connected to this._positions, both need to be managed separately!
	//			 this._positions is a visual representation of the board while (technically) this._pieces
	// 			 is a logical representation of the board.
	private _pieces: { [key in CHESS_COLOR]: ChessPiece[] };

	private _piecesMap: Map<string, ChessPiece>;

	private _positions: string[][]; 	// 8x8 matrix storing the entire board's positions
	private _currentTurn: CHESS_COLOR; 	// Stores color of the player whose current turn it is

	// Game states
	private _checkmate: boolean; 	// Did the game end in checkmate
	private _stalemate: boolean; 	// Did the game end in stalemate
	private _draw: boolean; 		// Did the game end in draw

	private _check: ChessPiece | null; 		// The piece that's in check
	private _checkers: ChessPiece[]; 		// The pieces that are check'ing the check'ed piece
	private _pinnedPieces: ChessPiece[]; 	// An array that stores "pinned pieces" (A pinned piece is a piece "pinned" between an enemy and the king)

	private _eligibleForPromotion: ChessPiece | null; // The piece (pawn only) that is eligible for a promotion (one at a time)

	private _canClaimDraw: boolean;		// If true, lets players claim a draw (50 Move rule)
	private _isForcedDraw: boolean;		// If true, forcefully draws the game (75 Move rule)

	private _drawCounter: number;		// Internal counter to determine 50 Move rule and 75 Move rule states

	/**** Public getters ****/
	public get currentTurn(): CHESS_COLOR {
		return this._currentTurn;
	}

	public get positions(): string[][] {
		return this._positions;
	}

	public get check(): ChessPiece | null {
		return this._check;
	}

	public get checkers(): ChessPiece[] {
		return this._checkers;
	}

	public get checkmate(): boolean {
		return this._checkmate;
	}

	public get stalemate(): boolean {
		return this._stalemate;
	}

	public get pieces(): ({ [key in CHESS_COLOR]: ChessPiece[] }) {
		return this._pieces;
	}

	public get allowedMoves(): ({ [key in CHESS_COLOR]: TChessPosition[] }) {
		return this._allowedMoves;
	}

	public get pinnedPieces(): ChessPiece[] {
		return this._pinnedPieces;
	}

	public get eligibleForPromotion(): ChessPiece | null {
		return this._eligibleForPromotion;
	}

	public get draw(): boolean {
		return this._draw;
	}

	public get canClaimDraw(): boolean {
		return this._canClaimDraw;
	}

	public get isForcedDraw(): boolean {
		return this._isForcedDraw;
	}

	constructor() {
		this._positions = [[], [], [], [], [], [], [], []];
		this._pieces = {
			[CHESS_COLOR.WHITE]: [],
			[CHESS_COLOR.BLACK]: []
		};
		this._attackedSquares = {
			[CHESS_COLOR.WHITE]: {},
			[CHESS_COLOR.BLACK]: {}
		};
		this._allowedMoves = {
			[CHESS_COLOR.WHITE]: [],
			[CHESS_COLOR.BLACK]: []
		};
		this._currentTurn = CHESS_COLOR.WHITE;
		this._piecesMap = new Map<string, ChessPiece>();

		this._check = null;
		this._checkers = [];

		this._checkmate = false;
		this._stalemate = false;

		this._pinnedPieces = [];
		this._eligibleForPromotion = null;

		this._draw = false;

		this._canClaimDraw = false;
		this._isForcedDraw = false;

		this._drawCounter = 0;
	}

	async init(): Promise<void> {
		for (let i = 0; i != 8; i++) {
			for (let j = 0; j != 8; j++) {
				const curPiece: CHESS_PIECE = defaultBoard[i][j] as CHESS_PIECE;
				this._positions[i].push(curPiece);

				if (curPiece) {
					const pieceUID = getChessPieceKey(curPiece);
					let currentColor = objIncludes(CHESS_PIECE_BLACK, curPiece) ? CHESS_COLOR.BLACK : CHESS_COLOR.WHITE;

					const newPiece = new ChessPiece(this, currentColor, curPiece, { x: j, y: i }, pieceUID)

					this._piecesMap.set(pieceUID, newPiece);

					this._pieces[currentColor].push(newPiece);
					this._attackedSquares[currentColor][curPiece] = [];
				}
			}
		}

		this._currentTurn = CHESS_COLOR.WHITE;

		this.updateAttackedSquares();
	}

	getOtherTurn(): CHESS_COLOR {
		return this._currentTurn === CHESS_COLOR.BLACK ? CHESS_COLOR.WHITE : CHESS_COLOR.BLACK;
	}

	// special helper function for <ChessPiece>.promote() since <ChessBoard>.nextTurn() is private
	onPromote() {
		if (this._eligibleForPromotion) {
			this._eligibleForPromotion = null;
			this.nextTurn();
		}
	}

	private nextTurn() {
		this._currentTurn = this.getOtherTurn();
	}

	getPieceByUID(pieceUID: string): ChessPiece | undefined {
		return this._piecesMap.get(pieceUID)
	}

	getPieceOnPosition(pos: TChessPosition): ChessPiece | undefined {
		const concatPiecesArr = this._pieces[CHESS_COLOR.BLACK].concat(this._pieces[CHESS_COLOR.WHITE]);

		const res = concatPiecesArr.find((piece: ChessPiece) =>
			piece.position.x === pos.x && piece.position.y === pos.y
		);

		return res;
	}

	getAttackerOnPosition(pos: TChessPosition): ChessPiece | undefined {
		let attackedSquares: TChessMove[] = [];

		for (const squares of Object.values(this._attackedSquares[this.getOtherTurn()])) {
			attackedSquares = attackedSquares.concat(squares);
		}

		const res = attackedSquares.find((move: TChessMove) => move.x === pos.x && move.y === pos.y && move.isAttackableMove);

		return res?.attackingPiece;
	}

	move(piece: ChessPiece, newPos: TChessPosition): CHESS_MOVE_RESPONSES {
		if (piece.color != this._currentTurn)
			return CHESS_MOVE_RESPONSES.INVALID_TURN;

		if (!this.validateMove(piece, newPos))
			return CHESS_MOVE_RESPONSES.INVALID_MOVE;

		// nuh uh promote your pawn first
		if (this._eligibleForPromotion && piece.position.x != this._eligibleForPromotion.position.x && piece.position.y != this._eligibleForPromotion.position.y)
			return CHESS_MOVE_RESPONSES.INVALID_MOVE;

		// Logical position
		this._positions[piece.position.y][piece.position.x] = "";
		this._positions[newPos.y][newPos.x] = piece.type;

		// EN PASSANT
		if (piece.isPawn() && piece.pawnInitialMove) {
			piece.pawnInitialMove = false;

			if (Math.abs(newPos.y - piece.position.y) === 2) {
				let otherPiece = null;

				if (!otherPiece && newPos.x - 1 >= 0)
					otherPiece = this.getPieceOnPosition({ x: newPos.x - 1, y: newPos.y });

				if (!otherPiece && newPos.x + 1 < 8)
					otherPiece = this.getPieceOnPosition({ x: newPos.x + 1, y: newPos.y });

				if (otherPiece && otherPiece.color != piece.color)
					piece.canEnPassant = true;
			}

			this._drawCounter = 0;
			this._canClaimDraw = false;
		}

		if (this._check) {
			this._check = null;
			this._checkers = [];

			this._allowedMoves = {
				[CHESS_COLOR.WHITE]: [],
				[CHESS_COLOR.BLACK]: []
			};
		}

		piece.position.x = newPos.x;
		piece.position.y = newPos.y;

		if (piece.isPawn() && piece.isEligibleForPromotion()) {
			// we don't change turns right away in this case so player can choose what they need to promote the piece to
			// we change turns AFTER the player chooses, that is, in the <ChessPiece>.promote() function
			this._eligibleForPromotion = piece;
		}
		else {
			this.nextTurn();
		}

		// do we need to unpin any pinned piece?
		this._pinnedPieces.forEach(pinnedPiece => {
			let pinnedColorKing = pinnedPiece.getKing();

			// should never happen
			if (!pinnedColorKing) {
				return console.error("SOMETHING WENT HORRIBLY WRONG");
			}

			// comparing by types is unreliable for any piece except king and queen, since other pieces can be multiple
			// so we compare by their positions instead
			if (
				pinnedColorKing.type === piece.type ||
				pinnedPiece.pinner?.position.x === piece.position.x && pinnedPiece.pinner?.position.y === piece.position.y ||
				pinnedPiece.position.x === piece.position.x && pinnedPiece.position.y === piece.position.y
			) {
				pinnedPiece.isPinned = false;
				pinnedPiece.pinner = null;

				this._pinnedPieces.forEach((pin, index) => {
					if (pin.position.x === pinnedPiece.position.x && pin.position.y === pinnedPiece.position.y)
						this._pinnedPieces.splice(index, 1);
				})
			}
		})

		if (!piece.hasMoved)
			piece.hasMoved = true;

		this._drawCounter++;

		this.updateAttackedSquares();
		this.postMove();

		return CHESS_MOVE_RESPONSES.SUCCESSFUL;
	}

	kill(piece: ChessPiece, newPos: TChessPosition, targetPiece: ChessPiece): CHESS_MOVE_RESPONSES {

		// catnip moment
		if (piece.color != this._currentTurn)
			return CHESS_MOVE_RESPONSES.INVALID_TURN;

		if (!this.validateMove(piece, newPos))
			return CHESS_MOVE_RESPONSES.INVALID_MOVE;

		// nuh uh promote your pawn first
		if (this._eligibleForPromotion && piece.position.x != this._eligibleForPromotion.position.x && piece.position.y != this._eligibleForPromotion.position.y)
			return CHESS_MOVE_RESPONSES.INVALID_MOVE;

		let targetPieceIndex = 0;

		this._positions[targetPiece.position.y][targetPiece.position.x] = "";

		this._pieces[targetPiece.color].map((piece: ChessPiece, index: number) => {
			if (piece.position.x === targetPiece.position.x && piece.position.y === targetPiece.position.y) {
				targetPieceIndex = index;
			}
		})

		this._pieces[targetPiece.color].splice(targetPieceIndex, 1);

		this._attackedSquares[targetPiece.color][targetPiece.type] = [];

		this._drawCounter = 0;
		this._canClaimDraw = false;

		return this.move(piece, newPos);
	}

	validateMove(piece: ChessPiece, newPos: TChessPosition): boolean {
		return piece.moves.some(move => move.x === newPos.x && move.y === newPos.y);
	}

	updateAttackedSquares() {
		// clear attacked squares
		for (let piece of this._pieces[CHESS_COLOR.BLACK].concat(this._pieces[CHESS_COLOR.WHITE])) {
			this._attackedSquares[piece.color][piece.type] = [];
		}

		// update attacked squares
		for (let piece of this._pieces[CHESS_COLOR.BLACK].concat(this._pieces[CHESS_COLOR.WHITE])) {
			let attackedSquares: TChessMove[] = piece.getMovablePositions();
			for (let [i, v] of Object.entries(attackedSquares)) {
				const index: number = i as unknown as number; // dun'ask'me'y
				const move: TChessMove = v;

				if (piece.isPawn()) {
					if (!move.isAttackableMove || !move.isPawnDiagonal)
						continue;
				}

				move.attackingPiece = piece;
				attackedSquares[index] = move;

				if (move.isKillingMove && move.killTarget?.isKing()) {
					this._check = move.killTarget;

					if (!this._checkers.find((checkingPiece: ChessPiece) => checkingPiece.position.x === piece.position.x && checkingPiece.position.y === piece.position.y))
						this._checkers.push(piece);
				}
			}
			this._attackedSquares[piece.color][piece.type] = this._attackedSquares[piece.color][piece.type]?.concat(attackedSquares);
		}
	}

	// never meant to be called from outside the class
	private postMove() {
		if (this._checkers.length === 1) {
			let king: ChessPiece = this._check as ChessPiece; // explicit cast because this._check will not be null if this._checkers.length > 0
			let checker: ChessPiece = this._checkers[0];

			let dir: TChessPosition = getDirection(king.position, checker.position)

			if (!checker.isKnight()) {

				// this very complex looking for loop iterates on the squares BETWEEN the king and the checker
				// so pieces are only allowed to generate moves on these squares so that they protect the king
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

					// yes this is intentional
					// however pushing this move to king's available moves isn't
					this._allowedMoves[king.color].push({ x: i, y: j })
				}
			}

			this._allowedMoves[king.color].push({ x: checker.position.x, y: checker.position.y })
		}
		let availableMoves: TChessMove[] = []

		if (this._check && this._checkers.length) {

			// NOTE: make sure to CLOSELY notice the variable names at this part,
			//       one variable is **allowed**Moves while the other is
			//       **available**Moves
			let allowedMoves = this._allowedMoves[this._check.color]
			let possibleMoves: TChessPosition[] = this._check.getMovablePositions().filter(move => !move.isFriendlyPiece);

			for (let piece of Object.values(this._pieces[this._check.color])) {
				availableMoves = availableMoves.concat(piece.getMovablePositions())
			}

			if (!possibleMoves.length) {
				for (const availableMove of availableMoves) {
					const move = allowedMoves.find((allowedMove: TChessPosition) => allowedMove.x === availableMove.x && allowedMove.y === availableMove.y);

					if (move)
						possibleMoves.push(move);
				}
			}

			if (!possibleMoves.length) {
				this._checkmate = true;
			}
		} else {
			for (let piece of Object.values(this._pieces[this._currentTurn])) {
				availableMoves = availableMoves.concat(piece.getMovablePositions())
			}
			availableMoves = availableMoves.filter(move => !move.isFriendlyPiece && (move.isPawnDiagonal ? move.isKillingMove : true))

			if (!availableMoves.length)
				this._stalemate = true
		}

		// 50 Move rule
		if (this._drawCounter === 50)
			this._canClaimDraw = true;

		// 75 Move rule
		if (this._drawCounter === 75)
			this._isForcedDraw = true;

		if (!this._checkmate && !this._stalemate && this._isForcedDraw && !this._draw)
			this._draw = true;
	}
}
