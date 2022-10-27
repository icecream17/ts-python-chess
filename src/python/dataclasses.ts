import { _unset_ } from "../types/types"
import { NotImplemented } from "./types"
import { hash, id, repr, type, NotImplementedError, ValueError } from "./builtin"

// Lots from cpython
// See https://docs.python.org/3/license.html
// Copyright © 2001-2022 Python Software Foundation; All Rights Reserved

type DataClass<F extends PropertyKey[], V extends { [k in F[number]]: unknown }> = Function & {
   new(...args: F): V
}

// https://github.com/python/cpython/blob/5871e19942fdcf83653924ae9a849941669c1143/Modules/itertoolsmodule.c#L102

/**
 * __repr__ is not exactly like python's since python filters out any field
 * that doesn't have the `repr` property, and I don't
 *
 * @example
 * ```
 * class A extends dataclass("one", "two") {
 *    public one = 1
 *    public two = 2
 * }
 * ```
 */
/**
 * Returns the same class as was passed in, with dunder methods
 * added based on the fields defined in the class.
 * Examines PEP 526 __annotations__ to determine fields.
 * If init is true, an __init__() method is added to the class. If
 * repr is true, a __repr__() method is added. If order is true, rich
 * comparison dunder methods are added. If unsafe_hash is true, a
 * __hash__() method function is added. If frozen is true, fields may
 * not be assigned to after instance creation. If match_args is true,
 * the __match_args__ tuple is added. If kw_only is true, then by
 * default all fields are keyword-only. If slots is true, an
 * __slots__ attribute is added.
 */
export const dataclass = <F extends PropertyKey[]> (
   fields: F,
   {
      // init=true, // Already default
      // repr=true,
      // eq=true,
      // order=false,
      unsafe_hash = false,
      // frozen=false,
      // match_args=true,
      // kw_only=false,
      // slots=false
   } = {}
) => {
   // if (frozen) {
   //    throw NotImplementedError("TS port implemented is designed such that this is impossible")
   // }

   let __hash__ = _unset_
   // if (!unsafe_hash && eq) {
   //    // if frozen, hash_add
   //    __hash__ = () => None
   // } else
   if (unsafe_hash) {
      const flds = fields//.filter(f => f.hash ?? f.compare) // default = True
      __hash__ = function () {
         return hash(flds.map(f => this[f]))
      }
   }

   // Avoid __repr__ recursion
   const seen = new Set()
   return class {
      __match_args__ = fields

      public __hash__?: typeof __hash__
      constructor() {
         if (__hash__ !== _unset_) {
            this.__hash__ = __hash__
         }
      }

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
