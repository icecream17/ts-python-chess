import { AnyObject, AnyClass } from './types'

/**
 * Makes a class callable.
 * Supports AnyCallableClass
 */
export function CallableClass <FuncReturn> (func: (...FuncArgs: any[]) => FuncReturn, cls: AnyClass): typeof func & typeof cls {
   return new Proxy(cls, {
      apply (_target: typeof cls, thisArg: any, argArray: any[]) {
         return func.apply(thisArg, argArray)
      }
   }) as typeof func & typeof cls
}

export class Enum {
   [key: string]: any
   [key: number]: any
   /* @ts-expect-error Wait until version something */
   [key: symbol]: any

   #keys: any[] = []
   #values: any[] = []
   #values2keys: AnyObject = {}
   constructor (dictionary: AnyObject) {
      for (const [key, value] of Object.entries(dictionary)) {
         this[key] = value
         this.#keys.push(value)
         this.#values.push(value)
         this.#values2keys[value] = key
      }
   }

   [Symbol.hasInstance](value: any): boolean {
      return this.#values.includes(value) || value in this
   }
}

export class IntFlagEnum extends Enum {
   #keys: any[] = []
   #values: any[] = []
   #values2keys: AnyObject = {}

   static isValidValue (value: any): boolean {
      return typeof value === 'number' && Number.isInteger(value) && value >= 0
   }

   get (value: any) {
      if (!IntFlagEnum.isValidValue(value)) {
         throw TypeError(`Invalid value ${value}. Must be a number and a positive integer`)
      }

      if (this.#values.includes(value)) {
         return this.#values2keys[value]
      }

      if (value === 0) {
         this.#keys.push('0')
         this.#values.push(0)
         this.#values2keys[0] = '0'
         return '0'
      }

      let keys = []
      for (let bit = 1; bit <= value; bit *= 2) {
         if (value & bit) {
            if (this.#values.includes(bit)) {
               keys.push(this.#values2keys[bit])
            } else {
               this.#keys.push(String(bit))
               this.#values.push(bit)
               this.#values2keys[bit] = String(bit)
               keys.push(String(bit))
            }
         }
      }

      // If made of 1 bit, the bit is already added, so
      if (this.#values.includes(value)) {
         return this.#values2keys[value]
      } else {
         const member = keys.join('|')
         this.#keys.push(member)
         this.#values.push(value)
         this.#values2keys[value] = member
         return member
      }
   }

   [Symbol.hasInstance](value: any): boolean {
      return IntFlagEnum.isValidValue(value) || value in this
   }
}
