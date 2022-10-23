import { ValueError } from "../python/builtin"
import { KingDistance, LineIndex, Square } from "../types/types"
import { abs, greater } from "../utils/math"

export { Square } from "../types/types"

/**
 * !`docsNotInPythonChess`
 * Squares can be thought of as having 6 bits,
 * where the upper three bits are the 0-indexed rank
 * and the lower three bits are the 0-indexed file.
 *
 * @example
 * ```ts
 * D5 === 32n
 * D5 === 0b100_011n
 * //   rank 4, file 3
 * // rank "5", file "D")
 * ```
 */
export const SQUARES = [
   0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n,
   8n, 9n, 10n, 11n, 12n, 13n, 14n, 15n,
   16n, 17n, 18n, 19n, 20n, 21n, 22n, 23n,
   24n, 25n, 26n, 27n, 28n, 29n, 30n, 31n,
   32n, 33n, 34n, 35n, 36n, 37n, 38n, 39n,
   40n, 41n, 42n, 43n, 44n, 45n, 46n, 47n,
   48n, 49n, 50n, 51n, 52n, 53n, 54n, 55n,
   56n, 57n, 58n, 59n, 60n, 61n, 62n, 63n,
] as const

export const [
   A1, B1, C1, D1, E1, F1, G1, H1,
   A2, B2, C2, D2, E2, F2, G2, H2,
   A3, B3, C3, D3, E3, F3, G3, H3,
   A4, B4, C4, D4, E4, F4, G4, H4,
   A5, B5, C5, D5, E5, F5, G5, H5,
   A6, B6, C6, D6, E6, F6, G6, H6,
   A7, B7, C7, D7, E7, F7, G7, H7,
   A8, B8, C8, D8, E8, F8, G8, H8,
] = SQUARES

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
 * @throws {ValueError} if the square name is invalid
 */
export const parse_square = (name: string) => {
   const index = SQUARE_NAMES.indexOf(name)
   if (index === -1) {
      const lowercase_name = name.toLowerCase()
      const hint = SQUARE_NAMES.includes(lowercase_name) ? `\n\t(Hint: convert to lowercase: ${lowercase_name})` : ""
      throw ValueError(`Invalid square name: "${name}"${hint}`)
   }
   return BigInt(index) as Square
}

/** Gets the name of the square, like `"a3"`. */ // @ts-expect-error -- bigint index
export const square_name = (square: Square) => SQUARE_NAMES[square]

/** Gets a square number by file and rank index */ // Optimization idea: rank_index << 3n | file_index
export const square = (file_index: LineIndex, rank_index: LineIndex) => rank_index * 8n + file_index as Square

/** Gets the file index of the square where `0` is the a-file */
export const square_file = (square: Square) => (square & 0b000111n) as LineIndex

/** Gets the rank index of the square where `0` is the first rank */
export const square_rank = (square: Square) => (square >> 3n) as LineIndex

/** Gets the distance (i.e., number of king steps) from square _a_ to _b_ */
export const square_distance = (a: Square, b: Square) =>
   greater(abs(square_file(a) - square_file(b)), abs(square_rank(a) - square_rank(b))) as KingDistance

/** Mirrors the square vertically */
export const square_mirror = (square: Square) => (square ^ 0b111000n) as Square

export const SQUARES_180 = SQUARES.map(square => square_mirror(square))
