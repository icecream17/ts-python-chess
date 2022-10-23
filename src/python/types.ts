import { _unset_, None } from "../types/types"
import { make_callable } from "../utils/objects"

class SingleValueType {
   static value = _unset_
   constructor() {
      if (this.constructor.value === _unset_) {
         this.constructor.value = this
      }
      return this.constructor.value
   }

   __repr__() {
      return this.constructor.name.slice(0, -4)
   }

   static [Symbol.hasInstance](val) {
      return val === this.value
   }
}

export const NoneType = new Proxy(class NoneType extends SingleValueType { }, {
   apply() {
      return None
   },
})
NoneType.value = None

export const NotImplementedType = make_callable(class NotImplementedType extends SingleValueType { })
export const NotImplemented = NotImplementedType()
