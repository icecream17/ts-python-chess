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

/*  Never gonna give you up, never gonna let you down,    */
/*  never gonna turn around, and, desert you.             */

import { Color, PieceType, None } from './types'

/**
 * @fileoverview
 * Corresponds to __init__ from the python chess library
 *
 * A chess library with move generation and validation,
 * Polyglot opening book probing, PGN reading and writing,
 * Gaviota tablebase probing,
 * Syzygy tablebase probing, and XBoard/UCI engine communication.
 */

/**
 * Instead of using the constructor, use the ColorClass.from() method instead
 * true instanceof ColorClass === true
 * false instanceof ColorClass === true
 * Everything else, even Object(Boolean), instanceof Color === false
 */
class ColorClass extends Boolean {
   static from (value?: any): boolean {
      return Boolean(value)
   }

   static [Symbol.hasInstance] (value?: unknown): value is boolean {
      return typeof value === 'boolean'
   }

   static readonly CorrespondingPythonClass = 'bool'
   static readonly WHITE: Color = true
   static readonly BLACK: Color = false
}

class PieceTypeClass extends Number {
   constructor (...args: any[]) {
      super(...args)

      if (!Number.isInteger(this.valueOf())) {
         throw RangeError('Number created must be an integer')
      } else if (this.valueOf() < 1 || this.valueOf() > 6) {
         console.warn(`PieceType value ${this.valueOf()} is outside of valid PieceType range`)
      }
   }

   static from (value?: any): number {
      return Number(new PieceTypeClass(value))
   }

   static [Symbol.hasInstance] (value?: unknown): boolean | 'outside of range' {
      if (typeof value === 'number' && Number.isInteger(value)) {
         return (value >= 1 && value < 7) ? true : 'outside of range'
      } else {
         return false
      }
   }

   static readonly CorrespondingPythonClass = 'int'
   static readonly PAWN: PieceType = 1
   static readonly KNIGHT: PieceType = 2
   static readonly BISHOP: PieceType = 3
   static readonly ROOK: PieceType = 4
   static readonly QUEEN: PieceType = 5
   static readonly KING: PieceType = 6
   static readonly PIECE_TYPES: PieceType[] = [1, 2, 3, 4, 5, 6]
}

export const Chess = {
   Color: ColorClass,
   isColor: ColorClass[Symbol.hasInstance],

   // Really wish for shorthands
   // Interestingly enums of booleans are not allowed
   WHITE: true as Color,
   BLACK: false as Color,
   COLORS: [true, false] as Color[],
   COLOR_NAMES: ['black', 'white'],

   PieceType: PieceTypeClass,
   isPieceType: PieceTypeClass[Symbol.hasInstance],

   // BigInt doesn't work
   PAWN: 1 as PieceType,
   KNIGHT: 2 as PieceType,
   BISHOP: 3 as PieceType,
   ROOK: 4 as PieceType,
   QUEEN: 5 as PieceType,
   KING: 6 as PieceType,
   PIECE_TYPES: PieceTypeClass.PIECE_TYPES,

   // TODO: When creating the Piece class put these arrays into that class
   PIECE_SYMBOLS: [None, 'p', 'n', 'b', 'r', 'q', 'k'] as [null, ...string[]],
   PIECE_NAMES: [None, 'pawn', 'knight', 'bishop', 'rook', 'queen', 'king'] as [null, ...string[]],

   /** Gets the piece letter for a piece */
   piece_symbol (pieceType: PieceType): string {
      return Chess.PIECE_SYMBOLS[pieceType]
   },

   piece_name (pieceType: PieceType): string {
      return Chess.PIECE_NAMES[pieceType]
   },

   UNICODE_PIECE_SYMBOLS: {
      R: '♖', r: '♜',
      N: '♘', n: '♞',
      B: '♗', b: '♝',
      Q: '♕', q: '♛',
      K: '♔', k: '♚',
      P: '♙', p: '♟',
   },
   FILE_NAMES: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
   RANK_NAMES: ['1', '2', '3', '4', '5', '6', '7', '8'],

   /** The FEN for the standard chess starting position. */
   STARTING_FEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',

   /** The board part of the FEN for the standard chess starting position. */
   STARTING_BOARD_FEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',

   // Status: CreateIntFlagEnum('Status', {
   //    VALID: 0,
   //    NO_WHITE_KING: 1 << 0,
   //    NO_BLACK_KING: 1 << 1,
   //    TOO_MANY_KINGS: 1 << 2,
   //    TOO_MANY_WHITE_PAWNS: 1 << 3,
   //    TOO_MANY_BLACK_PAWNS: 1 << 4,
   //    PAWNS_ON_BACKRANK: 1 << 5,
   //    TOO_MANY_WHITE_PIECES: 1 << 6,
   //    TOO_MANY_BLACK_PIECES: 1 << 7,
   //    BAD_CASTLING_RIGHTS: 1 << 8,
   //    INVALID_EP_SQUARE: 1 << 9,
   //    OPPOSITE_CHECK: 1 << 10,
   //    EMPTY: 1 << 11,
   //    RACE_CHECK: 1 << 12,
   //    RACE_OVER: 1 << 13,
   //    RACE_MATERIAL: 1 << 14,
   //    TOO_MANY_CHECKERS: 1 << 15,
   //    IMPOSSIBLE_CHECK: 1 << 16,
   // })
}
