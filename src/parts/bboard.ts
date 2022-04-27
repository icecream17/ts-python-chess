import { bit_length, range8 } from "../utils/math"
import { Square } from "../types/types"
import { SQUARES } from "./board"

/** Would be the range from 0 to 2^64 - 1 is ranges were supported */
export type Bitboard = bigint

export const BB_EMPTY = 0n
export const BB_ALL = 0xffff_ffff_ffff_ffffn
export const BB_SQUARES = SQUARES.map(sq => 1n << sq)
export const [
   BB_A1, BB_B1, BB_C1, BB_D1, BB_E1, BB_F1, BB_G1, BB_H1,
   BB_A2, BB_B2, BB_C2, BB_D2, BB_E2, BB_F2, BB_G2, BB_H2,
   BB_A3, BB_B3, BB_C3, BB_D3, BB_E3, BB_F3, BB_G3, BB_H3,
   BB_A4, BB_B4, BB_C4, BB_D4, BB_E4, BB_F4, BB_G4, BB_H4,
   BB_A5, BB_B5, BB_C5, BB_D5, BB_E5, BB_F5, BB_G5, BB_H5,
   BB_A6, BB_B6, BB_C6, BB_D6, BB_E6, BB_F6, BB_G6, BB_H6,
   BB_A7, BB_B7, BB_C7, BB_D7, BB_E7, BB_F7, BB_G7, BB_H7,
   BB_A8, BB_B8, BB_C8, BB_D8, BB_E8, BB_F8, BB_G8, BB_H8,
] = BB_SQUARES

export const BB_CORNERS = BB_A1 | BB_H1 | BB_A8 | BB_H8
export const BB_CENTER = BB_D4 | BB_E4 | BB_D5 | BB_E5

export const BB_LIGHT_SQUARES = 0x55aa_55aa_55aa_55aan
export const BB_DARK_SQUARES = 0xaa55_aa55_aa55_aa55n

export const BB_FILES = range8.map(i => 0x0101_0101_0101_0101n << i)
export const [
   BB_FILE_A,
   BB_FILE_B,
   BB_FILE_C,
   BB_FILE_D,
   BB_FILE_E,
   BB_FILE_F,
   BB_FILE_G,
   BB_FILE_H,
] = BB_FILES

export const BB_RANKS = range8.map(i => 0xffn << (8n * i))
export const [
   BB_RANK_1,
   BB_RANK_2,
   BB_RANK_3,
   BB_RANK_4,
   BB_RANK_5,
   BB_RANK_6,
   BB_RANK_7,
   BB_RANK_8,
] = BB_RANKS

export const BB_BACKRANKS = BB_RANK_1 | BB_RANK_8


export const lsb = (bb: Bitboard) => bit_length(bb & -bb) - 1n

export function* scan_forward(bb: Bitboard): Generator<Square> {
   while (bb) {
      const r = bb & -bb
      yield bit_length(r) - 1n as Square
      bb ^= r
   }
}

export const msb = (bb: Bitboard) => bit_length(bb) - 1n

export function* scan_reversed(bb: Bitboard): Generator<Square> {
   while (bb) {
      const r = bit_length(bb) - 1n as Square
      yield r // @ts-expect-error
      bb ^= BB_SQUARES[r]
   }
}

export const popcount = (bb: Bitboard) => {
   let c = 0
   for (const char of bb.toString(2))
      if (char === "1")
         c++
   return c
}


export const flip_vertical = (bb: Bitboard) => {
   // https://www.chessprogramming.org/Flipping_Mirroring_and_Rotating#FlipVertically
   bb = ((bb >> 8n) & 0x00ff_00ff_00ff_00ffn) | ((bb & 0x00ff_00ff_00ff_00ffn) << 8n)
   bb = ((bb >> 16n) & 0x0000_ffff_0000_ffffn) | ((bb & 0x0000_ffff_0000_ffffn) << 16n)
   bb = (bb >> 32n) | ((bb & 0x0000_0000_ffff_ffffn) << 32n)
   return bb
}

export const flip_horizontal = (bb: Bitboard): Bitboard => {
   // https://www.chessprogramming.org/Flipping_Mirroring_and_Rotating#MirrorHorizontally
   bb = ((bb >> 1n) & 0x5555_5555_5555_5555n) | ((bb & 0x5555_5555_5555_5555n) << 1n)
   bb = ((bb >> 2n) & 0x3333_3333_3333_3333n) | ((bb & 0x3333_3333_3333_3333n) << 2n)
   bb = ((bb >> 4n) & 0x0f0f_0f0f_0f0f_0f0fn) | ((bb & 0x0f0f_0f0f_0f0f_0f0fn) << 4n)
   return bb
}

export const flip_diagonal = (bb: Bitboard): Bitboard => {
   // https://www.chessprogramming.org/Flipping_Mirroring_and_Rotating#FlipabouttheDiagonal
   let t = (bb ^ (bb << 28n)) & 0x0f0f_0f0f_0000_0000n
   bb = bb ^ t ^ (t >> 28n)
   t = (bb ^ (bb << 14n)) & 0x3333_0000_3333_0000n
   bb = bb ^ t ^ (t >> 14n)
   t = (bb ^ (bb << 7n)) & 0x5500_5500_5500_5500n
   bb = bb ^ t ^ (t >> 7n)
   return bb
}

export const flip_anti_diagonal = (bb: Bitboard): Bitboard => {
   // https://www.chessprogramming.org/Flipping_Mirroring_and_Rotating#FlipabouttheAntidiagonal
   let t = bb ^ (bb << 36n)
   bb = bb ^ ((t ^ (bb >> 36n)) & 0xf0f0_f0f0_0f0f_0f0fn)
   t = (bb ^ (bb << 18n)) & 0xcccc_0000_cccc_0000n
   bb = bb ^ t ^ (t >> 18n)
   t = (bb ^ (bb << 9n)) & 0xaa00_aa00_aa00_aa00n
   bb = bb ^ t ^ (t >> 9n)
   return bb
}


export const shift_down = (b: Bitboard): Bitboard => {
   return b >> 8n
}

export const shift_2_down = (b: Bitboard): Bitboard => {
   return b >> 16n
}

export const shift_up = (b: Bitboard): Bitboard => {
   return (b << 8n) & BB_ALL
}

export const shift_2_up = (b: Bitboard): Bitboard => {
   return (b << 16n) & BB_ALL
}

export const shift_right = (b: Bitboard): Bitboard => {
   return (b << 1n) & ~BB_FILE_A & BB_ALL
}

export const shift_2_right = (b: Bitboard): Bitboard => {
   return (b << 2n) & ~BB_FILE_A & ~BB_FILE_B & BB_ALL
}

export const shift_left = (b: Bitboard): Bitboard => {
   return (b >> 1n) & ~BB_FILE_H
}

export const shift_2_left = (b: Bitboard): Bitboard => {
   return (b >> 2n) & ~BB_FILE_G & ~BB_FILE_H
}

export const shift_up_left = (b: Bitboard): Bitboard => {
   return (b << 7n) & ~BB_FILE_H & BB_ALL
}

export const shift_up_right = (b: Bitboard): Bitboard => {
   return (b << 9n) & ~BB_FILE_A & BB_ALL
}

export const shift_down_left = (b: Bitboard): Bitboard => {
   return (b >> 9n) & ~BB_FILE_H
}

export const shift_down_right = (b: Bitboard): Bitboard => {
   return (b >> 7n) & ~BB_FILE_A
}
