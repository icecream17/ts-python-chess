import { None, PieceType } from "../types/types"

export { PieceType } from "../types/types"
export const [PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING] = [1, 2, 3, 4, 5, 6] as const
export const PIECE_TYPES = [PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING] as const
export const PIECE_SYMBOLS = [None, "p", "n", "b", "r", "q", "k"] as const
export const PIECE_NAMES = [None, "pawn", "knight", "bishop", "rook", "queen", "king"] as const

export const piece_symbol = (piece_type: PieceType) => PIECE_SYMBOLS[piece_type]
export const piece_name = (piece_type: PieceType) => PIECE_NAMES[piece_type]

export const UNICODE_PIECE_SYMBOLS = {
   "R": "♖", "r": "♜",
   "N": "♘", "n": "♞",
   "B": "♗", "b": "♝",
   "Q": "♕", "q": "♛",
   "K": "♔", "k": "♚",
   "P": "♙", "p": "♟",
} as const
