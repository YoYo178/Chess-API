export const defaultBoard = [
	["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
	["♟︎", "♟︎", "♟︎", "♟︎", "♟︎", "♟︎", "♟︎", "♟︎"],
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["", "", "", "", "", "", "", ""],
	["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
	["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"]
];

export enum CHESS_PIECE_BLACK {
	ROOK = "♜",
	KNIGHT = "♞",
	BISHOP = "♝",
	QUEEN = "♛",
	KING = "♚",
	PAWN = "♟︎"
};

export enum CHESS_PIECE_WHITE {
	ROOK = "♖",
	KNIGHT = "♘",
	BISHOP = "♗",
	QUEEN = "♕",
	KING = "♔",
	PAWN = "♙"
};

export type CHESS_PIECE = CHESS_PIECE_BLACK | CHESS_PIECE_WHITE;

export enum CHESS_COLOR {
	WHITE = "white",
	BLACK = "black"
};

export enum CHESS_MOVE_TYPE {
	DEFAULT = 0,

	STRAIGHT = 1 << 0,
	DIAGONAL = 1 << 1,
	KING = 1 << 2,
	KNIGHT = 1 << 3,
	PAWN = 1 << 4
};

export enum CHESS_PIECE_UNICODE {
	WHITE_KING = 9812,
	BLACK_KING = 9818,

	WHITE_QUEEN = 9813,
	BLACK_QUEEN = 9819,

	WHITE_ROOK = 9814,
	BLACK_ROOK = 9820,

	WHITE_BISHOP = 9815,
	BLACK_BISHOP = 9821,

	WHITE_KNIGHT = 9816,
	BLACK_KNIGHT = 9822,

	WHITE_PAWN = 9817,
	BLACK_PAWN = 9823
}

export enum CHESS_MOVE_RESPONSES {
	SUCCESSFUL = 0,
	INVALID_TURN = 1 << 0,
	INVALID_MOVE = 1 << 2,
}