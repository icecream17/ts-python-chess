// This file is
// 1. part of the js-python-chess package.
// 2. derived from the python-chess library
//
// Copyright (C) 2022 Steven Nguyen <icecream17.github@gmail.com>
// Copyright (C) 2012-2022 Niklas Fiekas <niklas.fiekas@backscattering.de>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

import { hash, repr, set, str, ValueError } from "../src/python/builtin"
import { range } from "../src/utils/math"
import * as chess from "../src/chess"

describe("Square", () => {
   test("square", () => {
      for (const square of chess.SQUARES) {
         const file_index = chess.square_file(square)
         const rank_index = chess.square_rank(square)
         expect(chess.square(file_index, rank_index)).toBe(square)
      }
   })

   test("shifts", () => {
      const shifts = [
         chess.shift_down,
         chess.shift_2_down,
         chess.shift_up,
         chess.shift_2_up,
         chess.shift_right,
         chess.shift_2_right,
         chess.shift_left,
         chess.shift_2_left,
         chess.shift_up_left,
         chess.shift_up_right,
         chess.shift_down_left,
         chess.shift_down_right,
      ]

      for (const shift of shifts) {
         for (const bb_square of chess.BB_SQUARES) {
            const shifted = shift(bb_square)
            const c = chess.popcount(shifted)
            expect(c).toBeLessThanOrEqual(1n)
            expect(c).toBe(chess.popcount(shifted & chess.BB_ALL))
         }
      }
   })

   test("parse_square", () => {
      expect(chess.parse_square("a1")).toBe(0n) // = Chess.A1
      expect(() => chess.parse_square("A1")).toThrow(ValueError)
      expect(() => chess.parse_square("a0")).toThrow(ValueError)
   })
})

describe("Piece", () => {
   test("equality", () => {
      const a = chess.Piece(chess.BISHOP, chess.WHITE)
      const b = chess.Piece(chess.KING, chess.BLACK)
      const c = chess.Piece(chess.KING, chess.WHITE)
      const d1 = chess.Piece(chess.BISHOP, chess.WHITE)
      const d2 = chess.Piece(chess.BISHOP, chess.WHITE)

      expect(set([a, b, c, d1, d2]).size).toBe(3)

      expect(a).toStrictEqual(d1)
      expect(d1).toStrictEqual(a)
      expect(d1).toStrictEqual(d2)

      expect(repr(a)).toBe(repr(d1))

      expect(a).not.toStrictEqual(b)
      expect(b).not.toStrictEqual(c)
      expect(b).not.toStrictEqual(d1)
      expect(a).not.toStrictEqual(c)

      expect(repr(a)).not.toBe(repr(b))
      expect(repr(b)).not.toBe(repr(c))
      expect(repr(b)).not.toBe(repr(d1))
      expect(repr(a)).not.toBe(repr(c))
   })

   test("from symbol", () => {
      const white_knight = chess.Piece.from_symbol("N")

      expect(white_knight.color).toBe(chess.WHITE)
      expect(white_knight.piece_type).toBe(chess.KNIGHT)
      expect(white_knight.symbol()).toBe("N")
      expect(str(white_knight)).toBe("N")

      const black_queen = chess.Piece.from_symbol("q")

      expect(black_queen.color).toBe(chess.BLACK)
      expect(black_queen.piece_type).toBe(chess.QUEEN)
      expect(black_queen.symbol()).toBe("q")
      expect(str(black_queen)).toBe("q")
   })

   // Change when https://github.com/tc39/proposal-iterator-helpers happens
   test("hash", () => {
      const pieces = set()
      const hashes = set()
      for (const symbol of "pnbrqkPNBRQK") {
         const piece = chess.Piece.from_symbol(symbol)
         pieces.add(piece)
         hashes.add(hash(piece))
      }

      expect(pieces.size).toBe(12)
      expect(hashes.__eq__(set(range(12)))).toBe(true)
   })
})

