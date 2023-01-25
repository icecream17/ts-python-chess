
import { repr, AssertionError } from "../python/builtin"
import { None, Optional } from "../types/types"
import { make_callable } from "../utils/objects"
import { BB_CORNERS, BB_EMPTY, BB_RANK_2, BB_RANK_1, BB_RANK_7, BB_RANK_8, BB_A1, BB_B1, BB_C1, BB_D1, BB_E1, BB_F1, BB_G1, BB_H1, BB_A8, BB_B8, BB_C8, BB_D8, BB_E8, BB_F8, BB_G8, BB_H8 } from "./bboard"
import { STARTING_BOARD_FEN } from "./board_metadata"
import { BB_BLACK, BB_WHITE } from "./colors"
import { PieceType, PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING } from "./pieces"

export type BaseBoardT = BaseBoard

/**
 * A board representing the position of chess pieces. See
 * `chess.Board` for a full board with move generation.
 * The board is initialized with the standard chess starting position, unless
 * otherwise specified in the optional *board_fen* argument. If *board_fen*
 * is ``None``, an empty board is created.
 */
export const BaseBoard = make_callable(class BaseBoard {
   constructor(board_fen?: Optional<string> = STARTING_BOARD_FEN) {
      this.occupied_co = [BB_EMPTY, BB_EMPTY]

      if (board_fen == None) {
         this.clear_board()
      } else if (board_fen === STARTING_BOARD_FEN) {
         this.reset_board()
      } else {
         this.set_board_fen(board_fen)
      }
   }

   /**
    * Resets pieces to the starting position.
    * `chess.Board` also resets the move stack, but not turn,
    * castling rights and move counters. Use `chess.Board.reset()` to
    * fully restore the starting position.
    */
   reset_board() {
      this.pawns = BB_RANK_2 | BB_RANK_7
      this.knights = BB_B1 | BB_G1 | BB_B8 | BB_G8
      this.bishops = BB_C1 | BB_F1 | BB_C8 | BB_F8
      this.rooks = BB_CORNERS
      this.queens = BB_D1 | BB_D8
      this.kings = BB_E1 | BB_E8

      this.promoted = BB_EMPTY

      this.occupied_co[WHITE] = BB_RANK_1 | BB_RANK_2
      this.occupied_co[BLACK] = BB_RANK_7 | BB_RANK_8
      this.occupied = BB_RANK_1 | BB_RANK_2 | BB_RANK_7 | BB_RANK_8
   }

   /**
    * Clears the board.
    * `chess.Board` also clears the move stack.
    */
   clear_board() {
      this.pawns = BB_EMPTY
      this.knights = BB_EMPTY
      this.bishops = BB_EMPTY
      this.rooks = BB_EMPTY
      this.queens = BB_EMPTY
      this.kings = BB_EMPTY

      this.promoted = BB_EMPTY

      this.occupied_co[WHITE] = BB_EMPTY
      this.occupied_co[BLACK] = BB_EMPTY
      this.occupied = BB_EMPTY
   }

   pieces_mask(piece_type: PieceType, color: Color): Bitboard {
      let bb
      if (piece_type === PAWN)
         bb = this.pawns
      else if (piece_type === KNIGHT)
         bb = this.knights
      else if (piece_type === BISHOP)
         bb = this.bishops
      else if (piece_type === ROOK)
         bb = this.rooks
      else if (piece_type === QUEEN)
         bb = this.queens
      else if (piece_type === KING)
         bb = this.kings
      else
         throw AssertionError("expected PieceType, got {piece_type!r}")

      return bb & self.occupied_co[color]
   }
})
