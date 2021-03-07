
import { Color, PieceType } from './types'

export class Integer extends Number {
   constructor (...args: any[]) {
      super(...args)

      if (!Number.isInteger(this.valueOf())) {
         throw RangeError('Number created must be an integer')
      } else if ('MIN' in this.constructor && 'MAX' in this.constructor) {
         if (this.valueOf() < (this.constructor as {MIN: number}).MIN || this.valueOf() > (this.constructor as {MAX: number}).MAX) {
            console.warn(`PieceType value ${this.valueOf()} is outside of valid PieceType range`)
         }
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
}

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
   static readonly WHITE: Color = true
   static readonly BLACK: Color = false
}

export class PieceTypeClass extends Number {
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
