import { dataclass } from "../python/dataclasses"
import { PieceType, piece_symbol, PIECE_SYMBOLS, UNICODE_PIECE_SYMBOLS } from "./pieces"
import { Color } from "./colors"
import { repr } from "../python/builtin"
import { index } from "../python/builtin_methods"
import { make_callable } from "../utils/objects"
import { piece } from "../chess.svg"

/** A piece with type and color */
export const Piece = make_callable(class Piece extends dataclass(["piece_type", "color"]) {
   constructor (
      /** The piece type. */
      public piece_type: PieceType,
      /** The color */
      public color: Color,
   ) {
      super()
   }

   /**
    * Gets the symbol ``P``, ``N``, ``B``, ``R``, ``Q`` or ``k`` for white
    * pieces or the lower-case variants for the black pieces.
    */
   symbol() {
      const symbol = piece_symbol(this.piece_type)
      return this.color ? symbol.toUpperCase() : symbol
   }

   /** Gets the unicode character for the piece. */
   unicode_symbol(invert_color = false) {
      const _symbol = piece_symbol(this.piece_type)
      const symbol = this.color === invert_color ? _symbol : _symbol.toUpperCase()
      return UNICODE_PIECE_SYMBOLS[symbol]
   }

   __hash__() {
      return this.piece_type + (this.color ? -1 : 5)
   }

   __repr__() {
      return `Piece.fromSymbol(${repr(this.symbol())})`
   }

   toString() {
      return this.symbol()
   }

   _repr_svg() {
      return piece(this, 45)
   }

   static from_symbol(symbol: string) {
      return new this(index(PIECE_SYMBOLS, symbol), symbol === symbol.toUpperCase())
   }
})
