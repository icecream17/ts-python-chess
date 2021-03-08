import { PieceTypeClass } from "../types/typeclasses"
import { None, PieceLetter, PieceName, PieceType } from "../types/types"

export const PiecePart = {
   PieceType: PieceTypeClass,
   isPieceType: PieceTypeClass[Symbol.hasInstance],

   // BigInt doesn't work
   PAWN: 1 as PieceType & 1,
   KNIGHT: 2 as PieceType & 2,
   BISHOP: 3 as PieceType & 3,
   ROOK: 4 as PieceType & 4,
   QUEEN: 5 as PieceType & 5,
   KING: 6 as PieceType & 6,
   PIECE_TYPES: PieceTypeClass.PIECE_TYPES,

   // TODO: When creating the Piece class put these arrays into that class
   PIECE_SYMBOLS: [None, 'p', 'n', 'b', 'r', 'q', 'k'] as [null, ...PieceLetter[]] & [null, 'p', 'n', 'b', 'r', 'q', 'k'],
   PIECE_NAMES: [None, 'pawn', 'knight', 'bishop', 'rook', 'queen', 'king'] as [null, ...PieceName[]] & [null, 'pawn', 'knight', 'bishop', 'rook', 'queen', 'king'],

   /** Gets the piece letter for a piece */
   piece_symbol (pieceType: PieceType): PieceLetter {
      return PiecePart.PIECE_SYMBOLS[pieceType]
   },

   piece_name (pieceType: PieceType): PieceName {
      return PiecePart.PIECE_NAMES[pieceType]
   },

   UNICODE_PIECE_SYMBOLS: {
      R: '♖', r: '♜',
      N: '♘', n: '♞',
      B: '♗', b: '♝',
      Q: '♕', q: '♛',
      K: '♔', k: '♚',
      P: '♙', p: '♟',
   },
}
