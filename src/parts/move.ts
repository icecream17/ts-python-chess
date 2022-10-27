
import { repr, ValueError } from "../python/builtin"
import { index } from "../python/builtin_methods"
import { dataclass } from "../python/dataclasses"
import { None } from "../types/types"
import { make_callable } from "../utils/objects"
import { InvalidMoveError } from "./move_errors"
import { piece_symbol, PieceType, PIECE_SYMBOLS } from "./pieces"
import { SQUARE_NAMES } from "./squares"

/**
 * Represents a move from a square to a square and possibly the promotion
 * piece type.
 * Drops and null moves are supported.
 */
export const Move = make_callable(class Move extends dataclass(["from_square", "to_square", "promotion", "drop"], {unsafe_hash: true}) {
   constructor (
      /** The source square. */
      public from_square: Square,
      /** The target square. */
      public to_square: Square,
      /** The promotion piece type or `None` */
      public promotion: PieceType | None = None,
      /** The drop piece type or `None` */
      public drop: PieceType | None = None,
   ) {
      super()
   }

   /**
    * Gets a UCI string for the move.
    *
    * For example, a move from a7 to a8 would be ``a7a8`` or ``a7a8q``
    * (if the latter is a promotion to a queen).
    *
    * The UCI representation of a null move is ``0000``.
    */
   uci() {
      if (this.drop)
         return piece_symbol(this.drop).toUpperCase() + "@" + SQUARE_NAMES[this.to_square]
      else if (this.promotion)
         return SQUARE_NAMES[this.from_square] + SQUARE_NAMES[this.to_square] + piece_symbol(this.promotion)
      else if (this.__bool__())
         return SQUARE_NAMES[this.from_square] + SQUARE_NAMES[this.to_square]
      else
         return "0000"
   }

   xboard() {
      return this.__bool__() ? this.uci() : "@@@@"
   }

   __bool__() {
      return Boolean(this.from_square || this.to_square || this.promotion || this.drop)
   }

   __repr__() {
      return `Move.from_uci(${repr(this.uci())})`
   }

   toString() {
      return this.uci()
   }

   /**
    * Parses a UCI string.
    *
    * :raises: :exc:`InvalidMoveError` if the UCI string is invalid.
    */
   static from_uci(uci: str) {
      if (uci === "0000") {
         return this.null()
      } else if (uci.length === 4 && "@" === uci[1]) {
         let drop, square
         try {
            drop = index(PIECE_SYMBOLS, uci[0].toLowerCase())
            square = index(SQUARE_NAMES, uci.slice(2))
         } catch (err) {
            if (err instanceof ValueError) throw InvalidMoveError(`invalid uci: ${repr(uci)}`)
            throw err
         }
         return this(square, square, None, drop)
      } else if (4 <= this.length && this.length <= 5) {
         let from_square, to_square, promotion
         try {
            from_square = index(SQUARE_NAMES, uci.slice(0,2))
            to_square = index(SQUARE_NAMES, uci.slice(2,4))
            from_square = uci.length === 5 ? index(PIECE_SYMBOLS, uci[4]) : None
         } catch (err) {
            if (err instanceof ValueError) throw InvalidMoveError(`invalid uci: ${repr(uci)}`)
            throw err
         }
         if (from_square === to_square) {
            throw InvalidMoveError(`invalid uci (use 0000 for null moves): ${repr(uci)}`)
         }
         return this(from_square, to_square, promotion)
      } else {
         throw InvalidMoveError(`expected uci string to be of length 4 or 5: ${repr(uci)}`)
      }
   }

   /**
    * Gets a null move.
    *
    * A null move just passes the turn to the other side (and possibly
    * forfeits en passant capturing). Null moves evaluate to ``False`` in
    * boolean contexts.
    *
    * >>> import chess
    * >>>
    * >>> bool(chess.Move.null())
    *
    * False
    */
   static null() {
      return this(0, 0)
   }
})
