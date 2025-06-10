import { ValueError, repr } from "../python/builtin"

/** Represents `val.index(element)` */
/**
 * Returns first index of value.
 * 
 * Raises ValueError if the value is not present.
 */
export const index = (val: unknown[] | string, element: unknown, start, stop) => {
   const index = val.indexOf(element, start)
   if (index === -1 || index > stop) {
      throw ValueError(repr(element) + " not found")
   }
   return index
}
