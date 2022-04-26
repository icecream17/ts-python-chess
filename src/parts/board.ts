import { KingDistance, LineIndex, Square } from "../types/types"

export { Square } from "../types/types"

// Note: Definitions are in the order that python-chess defines

export const FILE_NAMES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const

export const RANK_NAMES = ["1", "2", "3", "4", "5", "6", "7", "8"] as const

/** The FEN for the standard chess starting position. */
export const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

/** The board part of the FEN for the standard chess starting position. */
export const STARTING_BOARD_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"

export const [
   A1, B1, C1, D1, E1, F1, G1, H1,
   A2, B2, C2, D2, E2, F2, G2, H2,
   A3, B3, C3, D3, E3, F3, G3, H3,
   A4, B4, C4, D4, E4, F4, G4, H4,
   A5, B5, C5, D5, E5, F5, G5, H5,
   A6, B6, C6, D6, E6, F6, G6, H6,
   A7, B7, C7, D7, E7, F7, G7, H7,
   A8, B8, C8, D8, E8, F8, G8, H8,
] = [
    0,  1,  2,  3,  4,  5,  6,  7,
    8,  9, 10, 11, 12, 13, 14, 15,
   16, 17, 18, 19, 20, 21, 22, 23,
   24, 25, 26, 27, 28, 29, 30, 31,
   32, 33, 34, 35, 36, 37, 38, 39,
   40, 41, 42, 43, 44, 45, 46, 47,
   48, 49, 50, 51, 52, 53, 54, 55,
   56, 57, 58, 59, 60, 61, 62, 63,
] as const

export const SQUARES = [
   A1, B1, C1, D1, E1, F1, G1, H1,
   A2, B2, C2, D2, E2, F2, G2, H2,
   A3, B3, C3, D3, E3, F3, G3, H3,
   A4, B4, C4, D4, E4, F4, G4, H4,
   A5, B5, C5, D5, E5, F5, G5, H5,
   A6, B6, C6, D6, E6, F6, G6, H6,
   A7, B7, C7, D7, E7, F7, G7, H7,
   A8, B8, C8, D8, E8, F8, G8, H8,
] as const

export const SQUARE_NAMES = [
   "a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1",
   "a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2",
   "a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3",
   "a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4",
   "a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5",
   "a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6",
   "a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7",
   "a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8",
] as const

/**
 * Gets the square index for a given square _name_
 * @example
 * ```ts
 * parse_square("a1") // 0
 * ```
 * @throws {ReferenceError} if the square name is invalid
 */
export const parse_square = (name: string) => {
   const index = SQUARE_NAMES.indexOf(name)
   if (index === -1) {
      const lowercase_name = name.toLowerCase()
      let error_message = `Invalid square name: \"${name}\"!`
      if (SQUARE_NAMES.includes(lowercase_name)) {
         error_message += ` (Hint: convert to lowercase: ${lowercase_name})`
      }
      throw new ReferenceError(error_message)
   }
   return index as Square
}

/** Gets the name of the square, like `"a3"`. */
export const square_name = (square: Square) => SQUARE_NAMES[square]

/** Gets a square number by file and rank index */
export const square = (file_index: LineIndex, rank_index: LineIndex) => rank_index * 8 + file_index as Square

/** Gets the file index of the square where `0` is the a-file */
export const square_file = (square: Square) => (square & 7) as LineIndex

/** Gets the rank index of the square where `0` is the first rank */
export const square_rank = (square: Square) => (square >> 3) as LineIndex

/** Gets the distance (i.e., number of king steps) from square _a_ to _b_ */
export const square_distance = (a: Square, b: Square) =>
   Math.max(Math.abs(square_file(a) - square_file(b)), Math.abs(square_rank(a) - square_rank(b))) as KingDistance

/** Mirrors the square vertically */
export const square_mirror = (square: Square) => (square ^ 0b111000) as Square

export const SQUARES_180 = SQUARES.map(square => square_mirror(square)) as readonly Square[] & { length: 64 }
