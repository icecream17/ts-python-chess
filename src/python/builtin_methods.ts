import { ValueError, repr } from "../python/builtin"
export const index = (val: unknown[] | string, element: unknown) => {
   const index = val.indexOf(element)
   if (index === -1) {
      throw ValueError(repr(element) + " is not in list")
   }
   return index
}
