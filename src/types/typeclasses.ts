
import { Color, PieceType, Square, SquareName } from './types'

/**
 * Instead of using the constructor, use the ColorClass.from() method instead
 * true instanceof ColorClass === true
 * false instanceof ColorClass === true
 * Everything else, even Object(Boolean), instanceof Color === false
 */
export class ColorClass extends Boolean {
   static from (value?: any): boolean {
      return Boolean(value)
   }

   static [Symbol.hasInstance] (value?: unknown): value is boolean {
      return typeof value === 'boolean'
   }

   static readonly CorrespondingPythonClass = 'bool'
   static readonly Colors = [false, true] as const
   static readonly WHITE: Color & true = true
   static readonly BLACK: Color & false = false
}

/** Base python class */
export class Integer extends Number {
   static readonly CorrespondingPythonClass = 'int'

   constructor (...args: any[]) {
      super(...args)

      if (!Number.isInteger(this.valueOf())) {
         throw RangeError('Number created must be an integer')
      } else if ('MIN' in this.constructor && 'MAX' in this.constructor) {
         const _constructor = this.constructor as ReturnType<typeof makeMinMaxIntegerClassParent>
         if (this.valueOf() < _constructor.MIN || this.valueOf() > _constructor.MAX) {
            console.warn(`PieceType value ${this.valueOf()} is outside of valid PieceType range`)
         }
      }
   }

   static from (value?: any): ReturnType<typeof Number> {
      return Number(new PieceTypeClass(value))
   }

   static [Symbol.hasInstance] (value?: unknown): boolean {
      if (typeof value === 'number' && Number.isInteger(value)) {
         return true
      } else {
         return false
      }
   }
}

/**
 * Returns a class extending integer, but has a min and max value 
 * Extend the return value of this function to implement this functionality
 * 
 * The params are overrided by any static property on your class
 * @param {number} min - An inclusive minimum number that fits
 * @param {number} max - An inclusive maximum number that fits
 */
export function makeMinMaxIntegerClassParent (min: number, max: number) {
   return class MinMaxIntegerClassParent extends Integer {
      static readonly MIN = min
      static readonly MAX = max

      static [Symbol.hasInstance] (value?: Exclude<unknown, number>): boolean
      static [Symbol.hasInstance] (value?: unknown): boolean | 'outside of range' {
         if (typeof value === 'number' && Number.isInteger(value)) {
            return (value >= MinMaxIntegerClassParent.MIN && value <= MinMaxIntegerClassParent.MAX) ? true : 'outside of range'
         } else {
            return false
         }
      }
   }
}

export class PieceTypeClass extends makeMinMaxIntegerClassParent(1, 6) {
   static readonly MIN = 1
   static readonly MAX = 6

   static readonly CorrespondingPythonClass = 'int'
   static readonly PAWN: PieceType & 1 = 1
   static readonly KNIGHT: PieceType & 2 = 2
   static readonly BISHOP: PieceType & 3 = 3
   static readonly ROOK: PieceType & 4 = 4
   static readonly QUEEN: PieceType & 5 = 5
   static readonly KING: PieceType & 6 = 6
   static readonly PIECE_TYPES = [1, 2, 3, 4, 5, 6] as const
}

export class SquareClass extends makeMinMaxIntegerClassParent(0, 63) {
   static readonly MIN = 0
   static readonly MAX = 63

   static readonly CorrespondingPythonClass = 'int'
   static readonly Squares = [
       0,  1,  2,  3,  4,  5,  6,  7,
       8,  9, 10, 11, 12, 13, 14, 15,
      16, 17, 18, 19, 20, 21, 22, 23,
      24, 25, 26, 27, 28, 29, 30, 31,
      32, 33, 34, 35, 36, 37, 38, 39,
      40, 41, 42, 43, 44, 45, 46, 47,
      48, 49, 50, 51, 52, 53, 54, 55,
      56, 57, 58, 59, 60, 61, 62, 63,
   ] as const
   static readonly SquareNames = [
      'A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1',
      'A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2',
      'A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3',
      'A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4',
      'A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5',
      'A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6',
      'A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7',
      'A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8',
   ] as const
   static readonly A1: Square & 0 = 0
   static readonly B1: Square & 1 = 1
   static readonly C1: Square & 2 = 2
   static readonly D1: Square & 3 = 3
   static readonly E1: Square & 4 = 4
   static readonly F1: Square & 5 = 5
   static readonly G1: Square & 6 = 6
   static readonly H1: Square & 7 = 7
   static readonly A2: Square & 8 = 8
   static readonly B2: Square & 9 = 9
   static readonly C2: Square & 10 = 10
   static readonly D2: Square & 11 = 11
   static readonly E2: Square & 12 = 12
   static readonly F2: Square & 13 = 13
   static readonly G2: Square & 14 = 14
   static readonly H2: Square & 15 = 15
   static readonly A3: Square & 16 = 16
   static readonly B3: Square & 17 = 17
   static readonly C3: Square & 18 = 18
   static readonly D3: Square & 19 = 19
   static readonly E3: Square & 20 = 20
   static readonly F3: Square & 21 = 21
   static readonly G3: Square & 22 = 22
   static readonly H3: Square & 23 = 23
   static readonly A4: Square & 24 = 24
   static readonly B4: Square & 25 = 25
   static readonly C4: Square & 26 = 26
   static readonly D4: Square & 27 = 27
   static readonly E4: Square & 28 = 28
   static readonly F4: Square & 29 = 29
   static readonly G4: Square & 30 = 30
   static readonly H4: Square & 31 = 31
   static readonly A5: Square & 32 = 32
   static readonly B5: Square & 33 = 33
   static readonly C5: Square & 34 = 34
   static readonly D5: Square & 35 = 35
   static readonly E5: Square & 36 = 36
   static readonly F5: Square & 37 = 37
   static readonly G5: Square & 38 = 38
   static readonly H5: Square & 39 = 39
   static readonly A6: Square & 40 = 40
   static readonly B6: Square & 41 = 41
   static readonly C6: Square & 42 = 42
   static readonly D6: Square & 43 = 43
   static readonly E6: Square & 44 = 44
   static readonly F6: Square & 45 = 45
   static readonly G6: Square & 46 = 46
   static readonly H6: Square & 47 = 47
   static readonly A7: Square & 48 = 48
   static readonly B7: Square & 49 = 49
   static readonly C7: Square & 50 = 50
   static readonly D7: Square & 51 = 51
   static readonly E7: Square & 52 = 52
   static readonly F7: Square & 53 = 53
   static readonly G7: Square & 54 = 54
   static readonly H7: Square & 55 = 55
   static readonly A8: Square & 56 = 56
   static readonly B8: Square & 57 = 57
   static readonly C8: Square & 58 = 58
   static readonly D8: Square & 59 = 59
   static readonly E8: Square & 60 = 60
   static readonly F8: Square & 61 = 61
   static readonly G8: Square & 62 = 62
   static readonly H8: Square & 63 = 63
}
