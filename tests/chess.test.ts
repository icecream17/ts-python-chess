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

import { Chess } from '../src/chess'
import { PieceType } from '../src/types/types'
import { FunctionTest } from './function-test'

test('It actually parses', () => {
   expect('Pass').toBe('Pass')
})

describe('The corresponding constant chess values match', () => {
   test('Chess.COLORS', () => {
      expect(Chess.COLORS).toEqual([
         Chess.BLACK,
         Chess.WHITE
      ])
   })

   test('Chess.PIECE_TYPES', () => {
      expect(Chess.PIECE_TYPES).toEqual([
         Chess.PAWN,
         Chess.KNIGHT,
         Chess.BISHOP,
         Chess.ROOK,
         Chess.QUEEN,
         Chess.KING
      ])
   })
})

describe('Chess.isType constructors work properly', () => {
   test('Chess.Color', () => {
      expect(Chess.Color.from(Chess.WHITE)).toBe(Chess.WHITE)
      expect(Chess.Color.from(Chess.BLACK)).toBe(Chess.BLACK)
      expect(Chess.Color.from('truthy')).toBe(Chess.WHITE)
      expect(Chess.Color.from('')).toBe(Chess.BLACK)
      expect(Chess.Color.from()).toBe(Chess.BLACK)
   })

   test('Chess.PieceType', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation()

      expect(Chess.PieceType.from(0n)).toBe(0)
      expect(spy).toHaveBeenCalled()
      expect(() => Chess.PieceType.from(Infinity)).toThrow(RangeError)
      expect(() => Chess.PieceType.from('0.5')).toThrow(RangeError)
      expect(Chess.PieceType.from('4')).toBe(4)
      expect(spy).toHaveBeenCalledTimes(1)

      spy.mockRestore()
   })
})

describe('Chess.isType functions work properly', () => {
   test('Chess.isColor', () => {
      FunctionTest(Chess.isColor, false, { types: ['boolean'] })

      expect(Chess.isColor(false)).toBe(true)
      expect(Chess.isColor(true)).toBe(true)
      // @ts-expect-error Intentional functionality
      expect(false instanceof Chess.Color).toBe(true)
      // @ts-expect-error Intentional functionality
      expect(true instanceof Chess.Color).toBe(true)
   })

   test('Chess.isPieceType', () => {
      FunctionTest(Chess.isPieceType, false, { types: ['number'] })

      expect(Chess.isPieceType(-7)).toBe('outside of range')
      expect(Chess.isPieceType(-3)).toBe('outside of range')
      expect(Chess.isPieceType(-1)).toBe('outside of range')
      expect(Chess.isPieceType(0)).toBe('outside of range')
      expect(Chess.isPieceType(0.5)).toBe(false)
      expect(Chess.isPieceType(1)).toBe(true)
      expect(Chess.isPieceType(2)).toBe(true)
      expect(Chess.isPieceType(Math.PI)).toBe(false)
      expect(Chess.isPieceType(5)).toBe(true)
      expect(Chess.isPieceType(6)).toBe(true)
      expect(Chess.isPieceType(7)).toBe('outside of range')
      expect(Chess.isPieceType(314)).toBe('outside of range')
      expect(Chess.isPieceType(NaN)).toBe(false)
      expect(Chess.isPieceType(Infinity)).toBe(false)
      expect(Chess.isPieceType(-Infinity)).toBe(false)
   })
})

describe('Methods match to constant chess values', () => {
   const PIECE_TYPES_DOUBLED: Array<[PieceType, PieceType]> = Chess.PIECE_TYPES.map((type: PieceType) => [type, type])

   test.each(PIECE_TYPES_DOUBLED)('Chess.piece_symbol(%i) is equal to Chess.PIECE_SYMBOLS[%i]', (pieceType) => {
      expect(Chess.piece_symbol(pieceType)).toBe(Chess.PIECE_SYMBOLS[pieceType])
   })

   test.each(PIECE_TYPES_DOUBLED)('Chess.piece_name(%i) is equal to Chess.PIECE_NAMES[%i]', (pieceType) => {
      expect(Chess.piece_name(pieceType)).toBe(Chess.PIECE_NAMES[pieceType])
   })
})
