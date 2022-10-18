/** @overview Internal utilities for this TS port */

export const has_method = (val: unknown, method: PropertyKey) => method in val && typeof val[method] === "function"

class _Ignore {}
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

// Ok stop this is never going to be possible
// Especially with function method type

// Random type notes:
// typeof             always works
// Array.isArray      ( revoked Proxy -> TypeError )
// WeakMap#delete     ( this is not object or does not have internal slot [[WeakMapData]] -> TypeError )
// WeakSet#delete     ( "" but with [[WeakSetData]] -> TypeError )
const typename_map = Object.assign(Object.create(null), {
   null: "NoneType",
   String: "str",
   BigInt: "int",
   Number: "float",
})
export const typename = (value: unknown) => {
   const base_typename = value == null ? String(value) : (value?.constructor?.name ?? "unknown")
   return typename_map?.[base_typename] ?? base_typename
}
