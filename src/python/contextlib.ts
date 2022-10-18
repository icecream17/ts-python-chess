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

import { next, StopIteration, RuntimeError } from "./builtin"


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
