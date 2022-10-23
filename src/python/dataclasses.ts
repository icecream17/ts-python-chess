import { _unset_ } from "../types/types"
import { NotImplemented } from "./types"
import { id, repr, type, NotImplementedError } from "./builtin"

type DataClass<F extends PropertyKey[], V extends { [k in F[number]]: unknown }> = Function & {
   new(...args: F): V
}

// https://github.com/python/cpython/blob/5871e19942fdcf83653924ae9a849941669c1143/Modules/itertoolsmodule.c#L102

/**
 * __repr__ is not exactly like python's since python filters out any field
 * that doesn't have the `repr` property, and I don't
 *
 * Additionally all extra arguments (repr, eq, order, unsafe_hash, ...)
 * are unsupported.
 *
 * @example
 * ```
 * class A extends dataclass("one", "two") {
 *    public one = 1
 *    public two = 2
 * }
 * ```
 */
export const dataclass = <F extends PropertyKey[]> (
   fields: F,
   two = _unset_,
   // All extra arguments are currently unsupported
   // repr=true,
   // eq=true,
   // order=false,
   // unsafe_hash=false,
   // frozen=false,
   // match_args=true,
   // kw_only=false,
   // slots=false
) => {
   if (two !== _unset_) throw NotImplementedError("extra args unimplemented")

   // Avoid __repr__ recursion
   const seen = new Set()
   return class {
      __match_args__ = fields

      __eq__ (other: val) {
         if (this.constructor === other.constructor) {
            return fields.every(field => this[field] === other[field])
         }
         return NotImplemented
      }

      __repr__ () {
         const key = id(this)
         if (seen.has(key)) {
            return "..."
         }
         seen.add(key)
         try {
            return `${type(this).name}(${fields.map(field => `${String(field)}=${repr(this[field])}`).join(', ')})`
         } finally {
            seen.delete(key)
         }
      }
   }
}
