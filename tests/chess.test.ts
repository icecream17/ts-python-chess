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
      expect(chess.parse_square("a1")).toBe(0)
      expect(() => chess.parse_square("A1")).toThrow(ReferenceError)
      expect(() => chess.parse_square("a0")).toThrow(ReferenceError)
   })
})
