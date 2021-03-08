import { IntFlagEnum } from '../types/enumclasses';
import { SquareClass } from '../types/typeclasses';
import { Square, SquareName } from '../types/types';
import { ValueError } from '../types/errorclasses'

function parse_square (name: Exclude <any, SquareName>, strict: true): void
function parse_square (name: Exclude <any, SquareName>, strict: false): -1
function parse_square (name: SquareName, strict: boolean): Square
function parse_square (name: any, strict: boolean = false): Square | -1 {
   if (BoardPart.is_square_name(name)) {
      return BoardPart.SQUARE_NAMES.indexOf(name) as Square
   } else if (strict) {
      if (BoardPart.is_square_name(name.toLowerCase())) {
         throw new ValueError(`${name} does not exist in SQUARE_NAMES. Did you mean ${name.toLowerCase()}?`)
      } else {
         throw new ValueError(`${name} does not exist in SQUARE_NAMES.`)
      }
   }
   return -1
}


export const BoardPart = {
   FILE_NAMES: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
   RANK_NAMES: ['1', '2', '3', '4', '5', '6', '7', '8'],

   /** The FEN for the standard chess starting position. */
   STARTING_FEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',

   /** The board part of the FEN for the standard chess starting position. */
   STARTING_BOARD_FEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',

   Status: new IntFlagEnum({
      VALID: 0,
      NO_WHITE_KING: 1 << 0,
      NO_BLACK_KING: 1 << 1,
      TOO_MANY_KINGS: 1 << 2,
      TOO_MANY_WHITE_PAWNS: 1 << 3,
      TOO_MANY_BLACK_PAWNS: 1 << 4,
      PAWNS_ON_BACKRANK: 1 << 5,
      TOO_MANY_WHITE_PIECES: 1 << 6,
      TOO_MANY_BLACK_PIECES: 1 << 7,
      BAD_CASTLING_RIGHTS: 1 << 8,
      INVALID_EP_SQUARE: 1 << 9,
      OPPOSITE_CHECK: 1 << 10,
      EMPTY: 1 << 11,
      RACE_CHECK: 1 << 12,
      RACE_OVER: 1 << 13,
      RACE_MATERIAL: 1 << 14,
      TOO_MANY_CHECKERS: 1 << 15,
      IMPOSSIBLE_CHECK: 1 << 16,
   }),

   STATUS_VALID: 0,
   STATUS_NO_WHITE_KING: 1 << 0 as 1,
   STATUS_NO_BLACK_KING: 1 << 1 as 2,
   STATUS_TOO_MANY_KINGS: 1 << 2 as 4,
   STATUS_TOO_MANY_WHITE_PAWNS: 1 << 3 as 8,
   STATUS_TOO_MANY_BLACK_PAWNS: 1 << 4 as 16,
   STATUS_PAWNS_ON_BACKRANK: 1 << 5 as 32,
   STATUS_TOO_MANY_WHITE_PIECES: 1 << 6 as 64,
   STATUS_TOO_MANY_BLACK_PIECES: 1 << 7 as 128,
   STATUS_BAD_CASTLING_RIGHTS: 1 << 8 as 256,
   STATUS_INVALID_EP_SQUARE: 1 << 9 as 512,
   STATUS_OPPOSITE_CHECK: 1 << 10 as 1024,
   STATUS_EMPTY: 1 << 11 as 2048,
   STATUS_RACE_CHECK: 1 << 12 as 4096,
   STATUS_RACE_OVER: 1 << 13 as 8192,
   STATUS_RACE_MATERIAL: 1 << 14 as 16384,
   STATUS_TOO_MANY_CHECKERS: 1 << 15 as 32768,
   STATUS_IMPOSSIBLE_CHECK: 1 << 16 as 65536,

   Square: SquareClass,
   SQUARES: SquareClass.Squares,
   SQUARE_NAMES: SquareClass.SquareNames,
   A1: 0 as Square & 0,
   B1: 1 as Square & 1,
   C1: 2 as Square & 2,
   D1: 3 as Square & 3,
   E1: 4 as Square & 4,
   F1: 5 as Square & 5,
   G1: 6 as Square & 6,
   H1: 7 as Square & 7,
   A2: 8 as Square & 8,
   B2: 9 as Square & 9,
   C2: 10 as Square & 10,
   D2: 11 as Square & 11,
   E2: 12 as Square & 12,
   F2: 13 as Square & 13,
   G2: 14 as Square & 14,
   H2: 15 as Square & 15,
   A3: 16 as Square & 16,
   B3: 17 as Square & 17,
   C3: 18 as Square & 18,
   D3: 19 as Square & 19,
   E3: 20 as Square & 20,
   F3: 21 as Square & 21,
   G3: 22 as Square & 22,
   H3: 23 as Square & 23,
   A4: 24 as Square & 24,
   B4: 25 as Square & 25,
   C4: 26 as Square & 26,
   D4: 27 as Square & 27,
   E4: 28 as Square & 28,
   F4: 29 as Square & 29,
   G4: 30 as Square & 30,
   H4: 31 as Square & 31,
   A5: 32 as Square & 32,
   B5: 33 as Square & 33,
   C5: 34 as Square & 34,
   D5: 35 as Square & 35,
   E5: 36 as Square & 36,
   F5: 37 as Square & 37,
   G5: 38 as Square & 38,
   H5: 39 as Square & 39,
   A6: 40 as Square & 40,
   B6: 41 as Square & 41,
   C6: 42 as Square & 42,
   D6: 43 as Square & 43,
   E6: 44 as Square & 44,
   F6: 45 as Square & 45,
   G6: 46 as Square & 46,
   H6: 47 as Square & 47,
   A7: 48 as Square & 48,
   B7: 49 as Square & 49,
   C7: 50 as Square & 50,
   D7: 51 as Square & 51,
   E7: 52 as Square & 52,
   F7: 53 as Square & 53,
   G7: 54 as Square & 54,
   H7: 55 as Square & 55,
   A8: 56 as Square & 56,
   B8: 57 as Square & 57,
   C8: 58 as Square & 58,
   D8: 59 as Square & 59,
   E8: 60 as Square & 60,
   F8: 61 as Square & 61,
   G8: 62 as Square & 62,
   H8: 63 as Square & 63,

   /**
    * Utility function that only exists because of TypeScript types being ugh.
    * You might want to instead just use `SQUARE_NAMES.indexOf(name)`
    */
   is_square_name (name: any): name is SquareName {
      return BoardPart.SQUARE_NAMES.includes(name)
   },

   /**
    * Gets the index for a given square *name*
    * So `a1` gets `0`
    * 
    * @param {boolean} [strict] - Turn on to an error if the name doesn't exist
    * @throws {ValueError} - But only when the opt-in argument is passed
    */
   parse_square,
}
