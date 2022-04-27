
/** The absolute value of b */
export const abs = (b: bigint) => b < 0n ? -b : b

/** Returns the greater of two arguments */
export const greater = (a: bigint | number, b: bigint | number) => a > b ? a : b

/** The maximum for a list of args */
export const max = (arg1: bigint, ...args: bigint[]) => {
   for (const b of args) {
      if (b > arg1) {
         arg1 = b
      }
   }
   return arg1
}

export const range8 = [0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n] as const
export function* range(max: bigint) {
   for (let i = 0n; i < max; i++) {
      yield i
   }
}

/**
 * number of bits necessary to represent an integer in binary,
 * excluding the sign and leading zeros
 */
export const bit_length = (b: bigint) => BigInt(abs(b).toString(2).length)
