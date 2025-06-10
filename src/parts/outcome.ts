import { dataclass } from "../python/dataclasses"
import { Color, None, Optional } from "../types/types";
import { BLACK, WHITE } from "./colors";

/** Enum with reasons for a game to be over */
export const enum Termination {
   /** See `chess.Board.is_checkmate()`. */
   CHECKMATE,
   /** See `chess.Board.is_stalemate()`. */
   STALEMATE,
   /** See `chess.Board.is_insufficient_material()`. */
   INSUFFICIENT_MATERIAL,
   /** See `chess.Board.is_seventyfive_moves()`. */
   SEVENTYFIVE_MOVES,
   /** See `chess.Board.is_fivefold_repetition()`. */
   FIVEFOLD_REPETITION,
   /** See `chess.Board.can_claim_fifty_moves()`. */
   FIFTY_MOVES,
   /** See `chess.Board.can_claim_threefold_repetition()`. */
   THREEFOLD_REPETITION,
   /** See `chess.Board.is_variant_win()`. */
   VARIANT_WIN,
   /** See `chess.Board.is_variant_loss()`. */
   VARIANT_LOSS,
   /** See `chess.Board.is_variant_draw()`. */
   VARIANT_DRAW,
}

/**
 * Information about the outcome of an ended game,
 * usually obtained by `chess.Board.outcome()`.
 */
export const Outcome = make_callable(class Outcome extends dataclass(["termination", "winner"]) {
   constructor (
      /** The reason for the game to have ended */
      public termination: Termination,
      /** The winning color or `None` if drawn */
      public winner: Optional<Color>,
   ) {}

   result() {
      switch (this.winner) {
         case None: return "1/2-1/2";
         case WHITE: return "1-0";
         case BLACK: return "0-1";
      }
   }
}
