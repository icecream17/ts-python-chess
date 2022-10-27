/**
 * @overview Built-in functions, exceptions, and other objects
 **/
import { _unset_, None } from "../types/types"
import { __repr__ as str__repr__ } from "./str"
import { NoneType, NotImplemented } from "./types"
import { has_method, is_constructor, is_object, isinstance_str, make_callable } from "../utils/objects"

// Lots from cpython
// See https://docs.python.org/3/license.html
// Copyright © 2001-2022 Python Software Foundation; All Rights Reserved

// all constants are somewhere else
// None: "../types/types"
// NotImplemented: "./types"

// Built-in syntax //
/**
 * Simulates 'assert'
 * https://docs.python.org/3/reference/simple_stmts.html#the-assert-statement
 **/
export const python_assert = (cond: boolean, message = "") => {
   if (!cond) throw AssertionError(message)
}

// Every time you type "==" in python this happens, isn't that amazing
export const python_eq = (obj1, obj2) => {
   if (!is_object(obj1) || !is_object(obj2)) {
      // Note: python implements -0 === +0 and math.nan !== math.nan
      return obj1 === obj2
   }
   let ni = 0
   if ("__eq__" in obj1) {
      const result = obj1.__eq__(obj2)
      if (result !== NotImplemented) {
         return result
      }
      ni++
   }
   if ("__eq__" in obj2) {
      const result = obj2.__eq__(obj1)
      if (result !== NotImplemented) {
         return result
      }
      ni++
   }
   // Default object.__eq__, equivalent to Object.is
   // Really Object.is isn't necessary because NaN and -0 are already filtered
   // out, but semantics!
   // Verified by arbitrary class.__eq__ NotImplemented returns with
   // objects of the same class and of different class
   return Object.is(obj1, obj2)
}

type _python__exit__ =
   ((exc_type: typeof BaseException, exc_val: BaseException, exc_tb: string | undefined) => any) &
   ((exc_type: None, exc_val: None, exc_tb: None) => any)

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
   const enter_return = enter()

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


// Built-in functions and types //
// They're combined right now because idk what to do with `type`

// ///////////////////////////////////////////////////////////////////////////////
// const _noattr = { __proto__: null }
// export const getattr = <D>(val: unknown, default_: D | _unset_ = _unset_) => {

// }

///////////////////////////////////////////////////////////////////////////////
let _randomness;
try {
   const big64 = new BigInt64Array(1)
   _randomness = BigInt(globalThis.crypto.getRandomValues(big64)) // works by complete accident, gotta love js
} catch (err) {
   if (err instanceof globalThis.TypeError) _randomness = BigInt(1928307564073802901 * Math.random())
   else throw err
}

// const _PyHASH_MULTIPLER = 1_000_003n
const _PyHASH_BITS = 31n
const _PyHASH_MODULUS = 1n << _PyHASH_BITS - 1n
const _PyHASH_INF = 314159n

/**
 * Return the hash value for a given object
 *
 * Two objects that compare equal must also have the same hash
 *
 * The hash of an object that implements __hash__ is returned without changes
 *
 * https://github.com/python/cpython/blob/main/Python/pyhash.c
 */
export const hash = (val: unknown) => {
   // All that's necessary is:
   // - if they're equal, their hashes are equal
   // - return an integer
   const type = typeof val
   // So I'm just going to be very lazy
   if (type === "bigint") {
      return val
   } else if (type === "number") {
      if (Number.isNaN(val)) {
         return -2n
      } else if (!Number.isFinite(val)) {
         return BigInt(Math.sign(val)) * _PyHASH_INF
      } else if (Number.isInteger(val)) {
         return BigInt(val) // int floats and ints are equal
      } else if (val < 0) {
         return -hash(-val)
      }

      // Calculate floating-point mantissa+exponent
      let exponent = 1n
      while (!Number.isInteger(val)) {
         val += val
         exponent++
      }

      let m = BigInt(val)
      let e = exponent
      let x = 0n
      let y
      // Copy paste
      /* process 28 bits at a time;  this should work well both for binary
         and hexadecimal floating point. */
      while (m) {
         x = ((x << 28n) & _PyHASH_MODULUS) | x >> (_PyHASH_BITS - 28n);
         m *= 268435456n;  /* 2**28 */
         e -= 28n;
         y = m;  /* pull out integer part */
         m -= y;
         x += y;
         if (x >= _PyHASH_MODULUS)
            x -= _PyHASH_MODULUS;
      }

      /* adjust for the exponent;  first reduce it modulo _PyHASH_BITS */
      e %= _PyHASH_BITS
      return ((x << e) & _PyHASH_MODULUS) | x >> (_PyHASH_BITS - e);

      //return (exponent * BigInt(val) * _randomness) % (1 << 64)
   } else if (type === "string") {
      if (val === "") return -_randomness
      return [...val].reduce((accum, next) => accum << 5n ^ BigInt(next.codePointAt(0)) * _randomness, 7n) * BigInt(val.length)
   } else if (type === "symbol") {
      return hash(val.description) * 77n ^ 1000_0000_0000_0000n
   } else if (type === "undefined") {
      return 0n
   } else if (val === None) {
      return 12n
   } else if ("__hash__" in val) { // python runs __hash__ without any further checks
      const h = val.__hash__() // python does not allow the float 1.0 but I do bc PieceType
      if (typeof h !== "bigint" && !Number.isInteger(h)) {
         throw TypeError("__hash__ method should return a bigint")
      }
      return BigInt(h)
   } else if (Array.isArray(val)) {
      return val.reduce((accum, next) => accum << 5n ^ (is_object(next) ? 128n : hash(next)) * _randomness, 7n) * BigInt(val.length)
   } else if (val instanceof Map || val instanceof WeakMap || val instanceof Set || val instanceof WeakSet) {
      return hash([...val])
   }
   return id(h)
}

///////////////////////////////////////////////////////////////////////////////
// ez
const _ids = new WeakMap<object, bigint>()
let next_id = 0n
/**
 * Return the identity of an object
 *
 * This is guaranteed to be unique among simultaneously existing objects.
 * (CPython uses the object's memory address.)
 */
export const id = (object: object) =>
   _ids.get(object) ?? (_ids.set(object, next_id), next_id++)

///////////////////////////////////////////////////////////////////////////////
export const next = <T, R, D>(iter: Iterator<T, R>, default_: D | _unset_ = _unset_) => {
   if (!has_method(iter, "next")) {
      throw TypeError(`'${type(iter).name}' object is not an iterator`)
   }
   const result = iter.next()
   if (!result.done || result.value !== undefined) {
      return result.value as T | Exclude<R, undefined>
   }
   if (default_ === _unset_) {
      throw StopIteration()
   }
   return default_
}

///////////////////////////////////////////////////////////////////////////////
/** Types implemented in {@link repr} */
type SupportedRepr =
   | string
   | None
   | ((...args: any) => any)
   | (new (...args: any) => any)
   | (abstract new (...args: any) => any)
   | { __repr__(): string }
   | boolean
   | bigint

/*
const GeneratorFunction = Object.getPrototypeOf(Object.getPrototypeOf((function* () { })())).constructor.constructor
const AsyncGeneratorFunction = Object.getPrototypeOf(Object.getPrototypeOf((async function* () { })())).constructor.constructor

const is_generator = (val: unknown): val extends Generator<any, any, any> ? boolean : false => {
   try {
      Object.getPrototypeOf(Object.getPrototypeOf(val)).constructor.constructor === GeneratorFunction
   } catch (err) {
      if (err instanceof TypeError) return false
      throw err
   }
}

const is_async_generator = (val: unknown): val extends Generator<any, any, any> ? boolean : false => {
   try {
      Object.getPrototypeOf(Object.getPrototypeOf(val)).constructor.constructor === AsyncGeneratorFunction
   } catch (err) {
      if (err instanceof TypeError) return false
      throw err
   }
}
*/

export const repr = (val: SupportedRepr) => {
   if (val === None) {
      return "None"
   } else if (typeof val === "string") {
      return str__repr__(val)
   } else if (typeof val === "number") {
      throw "Unimplemented!"
   } else if (typeof val === "symbol") {
      throw "Unimplemented!"
   } else if (typeof val === "bigint") {
      return val.toString()
   } else if (typeof val === "boolean") {
      return val ? "True" : "False"
   } else if (typeof val === "undefined") {
      throw TypeError("Python doesn't have undefined (None is null)")
   } else if ("__repr__" in val) {
      if (val.__repr__ === None) {
         throw TypeError(`Unhashable type: ${type(val).name}`)
      }
      const r = val.__repr__()
      if (!isinstance_str(r)) {
         throw TypeError(`__repr__ returned non-string (type ${type(r).name})`)
      }
      return r
   } else if (typeof val === "function") {
      let words = []
      if (is_constructor(val)) {
         words.push("class", `'${val.name}'`)
      } else {
         // Python just uses "function" or "method" even if it's a Generator or Async
         // And "<lambda>" even when there's a name, I don't check <lambda> yet
         if (Object.values(BUILTINS).includes(val)) {
            words.push("built-in function", val.name)
         } else {
            words.push("function", val.name, "at", "0x" + BUILTINS.id(val).toString(16))
         }
      }
      return `<${words.join(' ')}>`
   }
   throw "Unimplemented!"
}

///////////////////////////////////////////////////////////////////////////////
export const set = make_callable(class set<T> extends Set<T> {
   constructor (iterable?: Iterable<T> | null) {
      super()
      // isHTMLDDA
      if (iterable !== null && iterable !== undefined) {
         for (const val of iterable) {
            this.add(val)
         }
      }
   }

   override add(value) {
      if (this.has(value)) {
         return this
      }
      return super.add(value)
   }

   override delete(value) {
      for (const item of this)
         if (python_eq(item, value))
            return super.delete(item)
      return false
   }

   override has(value) {
      for (const item of this)
         if (python_eq(item, value))
            return true
      return false
   }

   __eq__(other) {
      if (type(this) === type(other)) {
         if (this.size !== other.size) {
            return false
         }

         for (const item of this) {
            if (!other.has(item)) {
               return false
            }
         }

         return true
      }
      return NotImplemented
   }
})

///////////////////////////////////////////////////////////////////////////////
export const str = String


///////////////////////////////////////////////////////////////////////////////
export const type = <T> (val: T, two = _unset_) => {
   if (two !== _unset_) throw NotImplementedError("3 arg version not implemented yet")
   if (val === None) return NoneType

   // @ts-expect-error -- if (val === undefined) val.constructor
   return val.constructor
}


/****************************************************************************/
// Note: While there are some JS error classes that would fit better [1]
//       I implement the Python hierarchy anyway.
//
//       As a plus, in this consistent manner, the code is relatively short...
//       Even python's __doc__'s are minimal.
//
// [1]: i.e. Type; Range for Value; Reference
//
// See https://docs.python.org/3/library/exceptions.html
// First __doc__ at: https://github.com/python/cpython/blob/9608bef84afd797ba6d16ec97439909f2f0d1095/Objects/exceptions.c#L541

/** Common base class for all exceptions */
export const BaseException = make_callable(class BaseException extends Error {
   constructor(...args) {
      super(...args)
      this.name = this.constructor.name
   }
})

/** Request to exit from the interpreter. */
export const SystemExit = make_callable(class SystemExit extends BaseException { })
/** Program interrupted by user. */
export const KeyboardInterrupt = make_callable(class KeyboardInterrupt extends BaseException { })
/** Request that a generator exit. */
export const GeneratorExit = make_callable(class GeneratorExit extends BaseException { })
/** Common base class for all non-exit exceptions. */
export const Exception = make_callable(class Exception extends BaseException { })
   /** Signal the end from iterator.__next__(). */
   export const StopIteration = make_callable(class StopIteration extends Exception { })
   /** Signal the end from iterator.__anext__(). */
   export const StopAsyncIteration = make_callable(class StopAsyncIteration extends Exception { })
   /** Base class for arithmetic errors. */
   export const ArithmeticError = make_callable(class ArithmeticError extends Exception { })
      /** Floating point operation failed. */
      export const FloatingPointError = make_callable(class FloatingPointError extends ArithmeticError { })
      /** Result too large to be represented. */
      export const OverflowError = make_callable(class OverflowError extends ArithmeticError { })
      /** Second argument to a division or modulo operation was zero. */
      export const ZeroDivisionError = make_callable(class ZeroDivisionError extends ArithmeticError { })
   /** Assertion failed. */
   export const AssertionError = make_callable(class AssertionError extends Exception { })
   /** Attribute not found. */
   export const AttributeError = make_callable(class AttributeError extends Exception { })
   /** Buffer error. */
   export const BufferError = make_callable(class BufferError extends Exception { })
   /** Read beyond end of file. */
   export const EOFError = make_callable(class EOFError extends Exception { })
   /** Import can't find module, or can't find name in module. */
   export const ImportError = make_callable(class ImportError extends Exception { })
      /** Module not found. */
      export const ModuleNotFoundError = make_callable(class ModuleNotFoundError extends ImportError { })
   /** Base class for lookup errors. */
   export const LookupError = make_callable(class LookupError extends Exception { })
      /** Sequence index out of range. */
      export const IndexError = make_callable(class IndexError extends Exception { })
      /** Mapping key not found. */
      export const KeyError = make_callable(class KeyError extends Exception { })
   /** Out of memory. */
   export const MemoryError = make_callable(class MemoryError extends Exception { })
   /** Name not found globally. */
   export const NameError = make_callable(class NameError extends Exception { })
      /** Local name referenced but not bound to a value. */
      export const UnboundLocalError = make_callable(class UnboundLocalError extends NameError { })
   /** Base class for I/O related errors. */
   export const OSError = make_callable(class OSError extends Exception { })
      /** I/O operation would block. */
      export const BlockingIOError = make_callable(class BlockingIOError extends OSError { })
      /** Child process error. */
      export const ChildProcessError = make_callable(class ChildProcessError extends OSError { })
      /** Connection error. */
      export const ConnectionError = make_callable(class ConnectionError extends OSError { })
         /** Broken pipe. */
         export const BrokenPipeError = make_callable(class BrokenPipeError extends ConnectionError { })
         /** Connection aborted. */
         export const ConnectionAbortedError = make_callable(class ConnectionAbortedError extends ConnectionError { })
         /** Connection refused. */
         export const ConnectionRefusedError = make_callable(class ConnectionRefusedError extends ConnectionError { })
         /** Connection reset. */
         export const ConnectionResetError = make_callable(class ConnectionResetError extends ConnectionError { })
      /** File already exists. */
      export const FileExistsError = make_callable(class FileExistsError extends OSError { })
      /** File not found. */
      export const FileNotFoundError = make_callable(class FileNotFoundError extends OSError { })
      /** Interrupted by signal. */
      export const InterruptedError = make_callable(class InterruptedError extends OSError { })
      /** Operation doesn't work on directories. */
      export const IsADirectoryError = make_callable(class IsADirectoryError extends OSError { })
      /** Operation only works on directories. */
      export const NotADirectoryError = make_callable(class NotADirectoryError extends OSError { })
      /** Not enough permissions. */
      export const PermissionError = make_callable(class PermissionError extends OSError { })
      /** Process not found. */
      export const ProcessLookupError = make_callable(class ProcessLookupError extends OSError { })
      /** Timeout expired. */
      export const TimeoutError = make_callable(class TimeoutError extends OSError { })
   /** Weak ref proxy used after referent went away. */
   export const ReferenceError = make_callable(class ReferenceError extends Exception { })
   /** Unspecified run-time error. */
   export const RuntimeError = make_callable(class RuntimeError extends Exception { })
      /** Method or function hasn't been implemented yet. */
      export const NotImplementedError = make_callable(class NotImplementedError extends RuntimeError { })
      /** Recursion limit exceeded. */
      export const RecursionError = make_callable(class RecursionError extends RuntimeError { })
   /** Invalid syntax. */
   export const SyntaxError = make_callable(class SyntaxError extends Exception { })
      /** Improper indentation. */
      export const IndentationError = make_callable(class IndentationError extends SyntaxError { })
         /** Improper mixture of spaces and tabs. */
         export const TabError = make_callable(class TabError extends IndentationError { })
   /**
    * Internal error in the Python interpreter.\
    * \
    * Please report this to the Python maintainer, along with the traceback,\
    * the Python version, and the hardware/OS platform and version.
    */
   export const SystemError = make_callable(class SystemError extends Exception { })
   /** Inappropriate argument type. */
   export const TypeError = make_callable(class TypeError extends Exception { })
   /** Inappropriate argument value (of correct type). */
   export const ValueError = make_callable(class ValueError extends Exception { })
      /** Unicode related error. */
      export const UnicodeError = make_callable(class UnicodeError extends ValueError { })
         /** Unicode decoding error. */
         export const UnicodeDecodeError = make_callable(class UnicodeDecodeError extends UnicodeError { })
         /** Unicode encoding error. */
         export const UnicodeEncodeError = make_callable(class UnicodeEncodeError extends UnicodeError { })
         /** Unicode translation error. */
         export const UnicodeTranslateError = make_callable(class UnicodeTranslateError extends UnicodeError { })
   /** Base class for warning categories. */
   export const Warning = make_callable(class Warning extends Exception { })
      /** Base class for warnings about deprecated features. */
      export const DeprecationWarning = make_callable(class DeprecationWarning extends Warning { })
      /**
       * Base class for warnings about features which will be deprecated\
       * in the future.
       **/
      export const PendingDeprecationWarning = make_callable(class PendingDeprecationWarning extends Warning { })
      /** Base class for warnings about dubious runtime behavior. */
      export const RuntimeWarning = make_callable(class RuntimeWarning extends Warning { })
      /** Base class for warnings about dubious syntax. */
      export const SyntaxWarning = make_callable(class SyntaxWarning extends Warning { })
      /** Base class for warnings generated by user code. */
      export const UserWarning = make_callable(class UserWarning extends Warning { })
      /**
       * Base class for warnings about constructs that will change semantically\
       * in the future.
       */
      export const FutureWarning = make_callable(class FutureWarning extends Warning { })
      /** Base class for warnings about probable mistakes in module imports */
      export const ImportWarning = make_callable(class ImportWarning extends Warning { })
      /**
       * Base class for warnings about Unicode related problems, mostly\
       * related to conversion problems.
       */
      export const UnicodeWarning = make_callable(class UnicodeWarning extends Warning { })
      /**
       * Base class for warnings about bytes and buffer related problems, mostly\
       * related to conversion from str or comparing to str.
       */
      export const BytesWarning = make_callable(class BytesWarning extends Warning { })
      /** Base class for warnings about encodings. */
      export const EncodingWarning = make_callable(class EncodingWarning extends Warning { })
      /** Base class for warnings about resource usage. */
      export const ResourceWarning = make_callable(class ResourceWarning extends Warning { })

