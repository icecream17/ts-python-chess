// This file is
// 1. part of the js-python-chess package.
// 2. derived from the python-chess library
//
// Copyright (C) 2021 Steven Nguyen <icecream17.github@gmail.com>
// Copyright (C) 2012-2021 Niklas Fiekas <niklas.fiekas@backscattering.de>
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

import { Color, PieceType } from './types'

/**
 * @fileoverview
 * Corresponds to __init__ from the python chess library
 *
 * A chess library with move generation and validation,
 * Polyglot opening book probing, PGN reading and writing,
 * Gaviota tablebase probing,
 * Syzygy tablebase probing, and XBoard/UCI engine communication.
 */

export const Chess = {
   Color: Boolean,
   isColor (value?: unknown): boolean {
      return typeof value === 'boolean'
   },

   // Really wish for shorthands
   // Interestingly enums of booleans are not allowed
   WHITE: true as Color,
   BLACK: false as Color,
   COLORS: [true, false] as Color[],
   COLOR_NAMES: ['black', 'white'],

   PieceType: BigInt,
   isPieceType (value?: unknown): boolean | 'outside of range' {
      if (typeof value === 'bigint') {
         return (value >= 1n && value < 7n) ? true : 'outside of range'
      } else {
         return false
      }
   },

   // I'll try out BigInt for now
   PAWN: 1n as PieceType,
   KNIGHT: 2n as PieceType,
   BISHOP: 3n as PieceType,
   ROOK: 4n as PieceType,
   QUEEN: 5n as PieceType,
   KING: 6n as PieceType,
   PIECE_TYPES: [1n, 2n, 3n, 4n, 5n, 6n] as PieceType[],
}
