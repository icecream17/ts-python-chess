import { None } from "../types/types"

/**
 * Simulates `with`.
 * https://docs.python.org/3/reference/compound_stmts.html#the-with-statement
 *
 * ```py
 * with context_manager:
 *    code
 * with (context_manager as alias):
 *    code
 * ```
 *
 * ```ts
 * python_with(context_manager, false, () => code)
 * python_with(context_manager, true, () => code)
 * ```
 */
export const python_with = (context_manager, as_alias: boolean, suite_callback) => {
   if (typeof as_alias !== "boolean") {
      throw TypeError("python_with: param as_alias must be a boolean")
   }

   // Steps 2 and 3 (note: example code is more accurate than description)
   const enter = context_manager.constructor.prototype.__enter__.bind(context_manager)
   const exit = context_manager.constructor.prototype.__exit__.bind(context_manager)

   // Step 4
   const enter_return = _enter()

   // Steps 5 6 and 7
   let suite_errored = false
   try {
      as_alias ? suite_callback(enter_return) : suite_callback()
   } catch (error) {
      suite_errored = true
      if (!exit(error.constructor, error, error.stack)) throw error
   }
   if (!suite_errored) exit(None, None, None)
}
