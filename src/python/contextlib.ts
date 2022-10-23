/**
 * @overview Utilities for with-statement contexts. See PEP 343.
 *
 * Ported to TS
 *
 * Note that currently this is only used within `xml.etree.ElementTree`
 * so only some of this file is implemented.
 *
 * Additionally the structures don't match exactly, as the original author
 * thinks the current design was a mistake:
 *
 * https://github.com/python/cpython/issues/55856
 **/

// This is a TS port of https://github.com/python/cpython/blob/main/Lib/contextlib.py
// Copyright © 2001-2022 Python Software Foundation; All Rights Reserved

// See https://docs.python.org/3/license.html

import { python_assert, next, type, StopIteration, NotImplementedError, RuntimeError } from "./builtin"
import { deque } from "./collections"
import { None } from "../types/types"


/** Shared functionality for @contextmanager and @asynccontextmanager. */
class _GeneratorContextManagerBase {
   constructor (func, args) {
      this.gen = func(...args)
   }
}

/** Helper for @contextmanager decorator. */
class _GeneratorContextManager extends _GeneratorContextManagerBase {
   __enter__() {
      try {
         return next(this.gen)
      } catch (err) {
         if (err instanceof StopIteration)
            throw RuntimeError("generator didn't yield")
         throw err
      }
   }

   __exit__(typ, value, traceback) {
      if (typ === None) {
         try {
            next(this.gen)
         } catch (err) {
            if (err instanceof StopIteration) return false
            throw err
         }
         throw RuntimeError("generator didn't stop")
      } else {
         if (value === None) {
            // Need to force instantiation so we can reliably
            // tell if we got the same exception back
            value = {}
         }
         try { // JS has this!??
            this.gen.throw(value)
         } catch (exc) {
            if (exc instanceof StopIteration)
               // Suppress StopIteration *unless* it's the same exception that
               // was passed to throw().  This prevents a StopIteration
               // raised inside the "with" statement from being suppressed.
               return exc !== value
            if (exc instanceof RuntimeError) {
               // Don't re-raise the passed in exception. (issue27122)
               if (exc === value) {
                  exc.stack = traceback
                  return false
               }
               // Avoid suppressing if a StopIteration exception
               // was passed to throw() and later wrapped into a RuntimeError
               // (see PEP 479 for sync generators; async generators also
               // have this behavior). But do this only if the exception wrapped
               // by the RuntimeError is actually Stop(Async)Iteration (see
               // issue29692).
               if (value instanceof StopIteration && exc.cause === value) {
                  exc.stack = traceback
                  return false
               }
               throw exc
            }
            if (exc instanceof BaseException) {
               // only re-raise if it's *not* the exception that was
               // passed to throw(), because __exit__() must not raise
               // an exception unless __exit__() itself failed.  But throw()
               // has to raise the exception to signal propagation, so this
               // fixes the impedance mismatch between the throw() protocol
               // and the __exit__() protocol.
               if (exc !== value)
                  throw exc
               return false
            }
            throw RuntimeError("generator didn't stop after throw()")
         }
      }
   }
}

/**
 * @contextmanager decorator.
 *
 * Typical usage:
 *
 *    @contextmanager
 *    def some_generator(<arguments>):
 *       <setup>
 *       try:
 *          yield <value>
 *       finally:
 *          <cleanup>
 *
 * This makes this:
 *
 *    with some_generator(<arguments>) as <variable>:
 *       <body>
 *
 * equivalent to this:
 *
 *    <setup>
 *    try:
 *       <variable> = <value>
 *       <body>
 *    finally:
 *       <cleanup>
 */
export const contextmanager = func => (...args) => new _GeneratorContextManager(func, args)

/** A base class for ExitStack and AsyncExitStack */
class _BaseExitStack {
   // cm: context manager
   // exc: exception
   // tb: traceback

   static _create_exit_wrapper(cm, cm_exit) {
      return cm_exit.bind(cm)
   }

   static _create_cb_wrapper(callback, ...args) {
      return function exit_wrapper(exc_type, exc, tb) {
         callback(...args)
      }
   }

   private _exit_callbacks = deque()

   /** Preserve the context stack by transferring it to a new instance. */
   pop_all() {
      const new_stack = new this.constructor()
      new_stack._exit_callbacks = this._exit_callbacks
      this._exit_callbacks = deque()
      return new_stack
   }

   /**
    * Registers a callback with the standard __exit__ method signature.
    *
    * Can suppress exceptions the same way __exit__ method can.
    * Also accepts any object with an __exit__ method (registering a call
    * to the method instead of the object itself).
    */
   push(exit) {
      // We use an unbound method rather than a bound method to follow
      // the standard lookup behaviour for special methods.
      const _cb_type = type(exit)

      if ("__exit__" in _cb_type) {
         this._push_cm_exit(exit, _cb_type.__exit__)
      } else {
         // Not a context manager, so assume it's a callable
         this._push_exit_callback(exit)
      }
      return exit  // Allow use as a decorator
   }

   /**
    * Enters the supplied context manager.
    * If successful, also pushes its __exit__ method as a callback and
    * returns the result of the __enter__ method.
    */
   enter_context(cm) {
      // We look up the special methods on the type to match the with
      // statement.
      const cls = type(cm)
      if (!("__enter__" in cls && "__exit__" in cls)) {
         throw TypeError(`'${cls.__module__}.${cls.__qualname__ ?? cls.__name__}'` +
                         " object does not support the context manager protocol")
      }
      const result = cls.__enter__(cm)
      this._push_cm_exit(cm, cls.__exit__)
      return result
   }

   /**
    * Registers an arbitrary callback and arguments.
    *
    * Cannot suppress exceptions.
    */
   callback(callback, ...args) {
      const _exit_wrapper = this._create_exit_wrapper(callback, ...args)

      // We changed the signature, so using @wraps is not appropriate, but
      // setting __wrapped__ may still help with introspection.
      _exit_wrapper.__wrapped__ = callback
      this._push_exit_callback(_exit_wrapper)
      return callback  // Allow use as a decorator
   }

   /** Helper to correctly register callbacks to __exit__ methods. */
   _push_cm_exit(cm, cm_exit) {
      _exit_wrapper = this._create_exit_wrapper(cm, cm_exit)
      this._push_exit_callback(_exit_wrapper, true)
   }

   _push_exit_callback(callback, is_sync=true) {
      this._exit_callbacks.push([is_sync, callback])
   }
}

// # Inspired by discussions on http://bugs.python.org/issue13585
/**
 * Context manager for dynamic management of a stack of exit callbacks.
 *
 * For example:
 *     with ExitStack() as stack:
 *         files = [stack.enter_context(open(fname)) for fname in filenames]
 *         # All opened files will automatically be closed at the end of
 *         # the with statement, even if attempts to open files later
 *         # in the list raise an exception.
 */
export class ExitStack extends _BaseExitStack {
   __enter__() {return this}

   __exit__(...exc_details) {
      const received_exc = exc_details[0] !== None

      // We manipulate the exception state so it behaves as though
      // we were actually nesting multiple with statements
      // const frame_exc = sys.exc_info()[1]
      // const _fix_exception_context = (new_exc, old_exc) => {
      //    // Context may not be correct, so find the end of the chain
      //    while (1) {
      //       const exc_context = new_exc.__context__
      //       if (exc_context === None || exc_context === old_exc)
      //          // Context is already set correctly (see issue 20317)
      //          return
      //       if (exc_context === frame_exc)
      //          break
      //       new_exc = exc_context
      //    }
      //    // Change the end of the chain to point to the exception
      //    // we expect it to reference
      //    new_exc.__context__ = old_exc
      // }

      // Callbacks are invoked in LIFO order to match the behaviour of
      // nested context managers
      let suppressed_exc = false
      // let pending_raise = false
      while (this._exit_callbacks.length) {
         const [is_sync, cb] = this._exit_callbacks.pop()
         python_assert(is_sync)
         try {
            if (cb(...exc_details)) {
               suppressed_exc = true
               // pending_raise = false
               exc_details = [None, None, None]
            }
         } catch (err) {
            throw NotImplementedError("error __context__ is not implemented (TS port)", { cause: err })
            // const new_exc_details = [type(err), err, err.stack] // sys.exc_info()
            // // simulate the stack of exceptions by setting the context
            // _fix_exception_context(new_exc_details[1], exc_details[1])
            // pending_raise = true
            // exc_details = new_exc_details
         }
      }
      // if (pending_raise) {
      //    let fixed_ctx;
      //    try {
      //       // bare "raise exc_details[1]" replaces our carefully
      //       // set-up context
      //       fixed_ctx = exc_details[1].__context__
      //       throw exc_details[1]
      //    } catch (err) {
      //       if (err instanceof BaseException)
      //          exc_details[1].__context__ = fixed_ctx
      //       throw err
      //    }
      // }
      return received_exc && suppressed_exc
   }

   /** Immediately unwind the context stack. */
   close() {
      this.__exit__(None, None, None)
   }
}
