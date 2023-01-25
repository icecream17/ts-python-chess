
export const has_method = (val: unknown, method: PropertyKey) => method in val && typeof val[method] === "function"

export const is_callable = (val: unknown) => {
   try {
      Function.prototype.toString.call(val)
      return true
   } catch (err) {
      if (err instanceof TypeError) return false

      // Impossible like below
      throw err
   }
}

class _Ignore { }
export const is_constructor = (arg: unknown) => {
   try {
      Reflect.construct(_Ignore, [], arg)
      return true
   } catch (err) {
      if (err instanceof TypeError) return false

      // Impossible unless there's some KeyboardInterrupt equivalent
      throw err
   }
}

export const is_object = (val: unknown) => val !== null && (typeof val === "object" || typeof val === "function")

/** isinstance(str) */
export const isinstance_str = (val: unknown) => typeof val === "string" || val instanceof String

/**
 * Makes a class callable
 *
 * @example
 * ```ts
 * make_callable(class{})
 * ```
 */
export const make_callable = <V, T extends (new (...args: A) => R), A extends V[] = ConstructorParameters<T>, R = InstanceType<T>> (c: T) => {
   return new Proxy(c, {
      apply (target, thisArg, argArray: A) {
         return new target(...argArray)
      }
   }) as T & ((...args: A) => R)
}
