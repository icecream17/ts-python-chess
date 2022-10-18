// https://docs.python.org/3/license.html says that it is GPL compatible
// In this special case idk whether Python owns this or someone else but
// I think python does, in which case:
//
// Copyright © 2001-2022 Python Software Foundation; All Rights Reserved

// # --------------------------------------------------------------------
// # The ElementTree toolkit is
// #
// # Copyright (c) 1999-2009 by Fredrik Lundh
// #
// # By obtaining, using, and/or copying this software and/or its
// # associated documentation, you agree that you have read, understood,
// # and will comply with the following terms and conditions:
// #
// # Permission to use, copy, modify, and distribute this software and
// # its associated documentation for any purpose and without fee is
// # hereby granted, provided that the above copyright notice appears in
// # all copies, and that both that copyright notice and this permission
// # notice appear in supporting documentation, and that the name of
// # Secret Labs AB or the author not be used in advertising or publicity
// # pertaining to distribution of the software without specific, written
// # prior permission.
// #
// # SECRET LABS AB AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD
// # TO THIS SOFTWARE, INCLUDING ALL IMPLIED WARRANTIES OF MERCHANT-
// # ABILITY AND FITNESS.  IN NO EVENT SHALL SECRET LABS AB OR THE AUTHOR
// # BE LIABLE FOR ANY SPECIAL, INDIRECT OR CONSEQUENTIAL DAMAGES OR ANY
// # DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS,
// # WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS
// # ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE
// # OF THIS SOFTWARE.
// # --------------------------------------------------------------------

import { StopIteration, IndexError, KeyError, ValueError, next, repr } from "../python/builtin"
import { isinstance_str } from "../python/utils"
import { None } from "../types/types"
import type { Element } from "./ElementTree" // "circular import"

// ( ttype ) | ( tag ) | whitespace
// where ( ttype ) is one of: 'stuff' "stuff" :: / // .. () != . * : [ ] ( ) @ =
// where ( tag ) is: {namespace in brackets}?[not stuff or whitespace char]+
export const xpath_tokenizer_re =
   /('[^']*'|"[^"]*"|::|\/\/?|\.\.|\(\)|!=|[/.*:\[\]\(\)@=])|((?:\{[^}]+\})?[^/\[\]\(\)@!=\s]+)|\s+/g

// @ts-expect-error -- undefined is implicitly returned
export function* xpath_tokenizer (pattern: string, namespaces: Map<string, string> | None = None): Generator<[string, string], undefined, unknown> {
   const default_namespace = namespaces?.get("") ?? None
   let parsing_attribute = false
   for (const [_match, ttype, tag] of pattern.matchAll(xpath_tokenizer_re)) {
      const token = [ttype, tag] as [string, string]
      if (tag && tag[0] != "{") {
         // JS String#split is different, so there's this indexOf...
         // JS "a b c".split(" ", 2) -> ["a", "b"]
         // PY "a b c".split(" ", 1) -> ["a", "b c"] (Note: python adds 1 to the argument)
         const colon_index = tag.indexOf(":")
         if (colon_index !== -1) {
            const prefix = tag.slice(0, colon_index)
            if (!namespaces || !namespaces.has(prefix))
               throw SyntaxError(`prefix ${repr(prefix)} not found in prefix map`)
            const uri = tag.slice(colon_index + 1)
            yield [ttype, `{${namespaces.get(prefix)}}${uri}`]
         } else if (default_namespace && !parsing_attribute) {
            yield [ttype, `{${default_namespace}}${tag}`]
         } else {
            yield token
         }
         parsing_attribute = false
      } else {
         yield token
         parsing_attribute = ttype === '@'
      }
   }
}

export const get_parent_map: (context: _SelectorContext) => Map<Element, Element> = (context: _SelectorContext) => {
   let parent_map: Map<Element, Element> | None = context.parent_map
   if (parent_map === None) {
      context.parent_map = parent_map = new Map<Element, Element>()
      for (const p of context.root)
         for (const e of p)
            parent_map.set(e, p)
   }
   return parent_map
}


export const _is_wildcard_tag = (tag: string) => tag.startsWith("{*}") || tag.endsWith("}*")

/** Internal utility for this TS port */
type __Selector = (context: _SelectorContext, result: IterableIterator<Element>) => Generator<Element, void, unknown>

/** Internal utility for this TS port */
const __prepare_select = (f: (elem: Element) => boolean) => function* select (context: _SelectorContext, result: IterableIterator<Element>) {
   for (const elem of result)
      if (f(elem))
         yield elem
}

/** Internal utility for this TS port */
const __prepare_select_children = (f: (elem: Element) => boolean) => function* select (context: _SelectorContext, result: IterableIterator<Element>) {
   for (const elem of result)
      for (const e of elem)
         if (f(e))
            yield e
}

export const _prepare_tag = (tag: string) => {
   let select: __Selector;
   if (tag === '{*}*') {
      // Same as '*', but no comments or processing instructions.
      // It can be a surprise that '*' includes those, but there is no
      // justification for '{*}*' doing the same.
      select = __prepare_select(elem => isinstance_str(elem.tag))
   } else if (tag === '{}*') {
      // Any tag that is not in a namespace.
      select = __prepare_select(elem => isinstance_str(elem.tag) && elem.tag[0] !== '{')
   } else if (tag.startsWith('{*}')) {
      // The tag in any (or no) namespace.
      const suffix = tag.slice(2)  // '}name'
      tag = tag.slice(3)
      select = __prepare_select(elem => elem.tag === tag || isinstance_str(elem.tag) && elem.tag.endsWith(suffix))
   } else if (tag.endsWith('}*')) {
      // Any tag in the given namespace.
      const ns = tag.slice(0, -1)
      select = __prepare_select(elem => isinstance_str(elem.tag) && elem.tag.startsWith(ns))
   } else {
      throw RuntimeError(`internal parser error, got ${tag}`)
   }
   return select
}

const prepare_child = (next_: Iterator<[string, string]>, token: [string, string]) => {
   let select: __Selector;
   let tag = token[1]
   if (_is_wildcard_tag(tag)) {
      const select_tag = _prepare_tag(tag)
      select = function (context, result) {
         function* select_child (result: IterableIterator<Element>) {
            for (const elem of result)
               for (const e of elem) // not all iterators are generators in js
                  yield e
         }
         return select_tag(context, select_child(result))
      }
   } else {
      if (tag.startsWith("{}"))
         tag = tag.slice(2)  // '{}tag' == 'tag'
      select = __prepare_select_children(e => e.tag === tag)
   }
   return select
}

// next and token are unused
const prepare_star = (next_: Iterator<[string, string]>, token: [string, string]) => function* select (context: _SelectorContext, result: IterableIterator<Element>) {
   for (const elem of result) {
      for (const e of elem) {
         yield e
      }
   }
}

const prepare_self = (next_: Iterator<[string, string]>, token: [string, string]) => function* select (context: _SelectorContext, result: IterableIterator<Element>) {
   for (const elem of result) {
      yield elem
   }
}

const prepare_descendant = (next_: Iterator<[string, string]>, token: [string, string]) => {
   try {
      token = next(next_)
   } catch (err) {
      if (err instanceof StopIteration) return
      else throw err
   }

   let tag: string;
   if (token[0] === "*")
      tag = "*"
   else if (!token[0])
      tag = token[1]
   else
      throw SyntaxError("invalid descendant")

   let select: __Selector;
   if (_is_wildcard_tag(tag)) {
      const select_tag = _prepare_tag(tag)
      select = function (context, result) {
         function* select_child (result: IterableIterator<Element>) {
            for (const elem of result)
               for (const e of elem.iter())
                  if (e !== elem)
                     yield e
         }
         return select_tag(context, select_child(result))
      }
   } else {
      if (tag.startsWith('{}'))
         tag = tag.slice(2)  // '{}tag' == 'tag'
      select = function* (context, result) {
         for (const elem of result)
            for (const e of elem.iter(tag))
               if (e !== elem)
                  yield e
      }
   }
   return select
}

const prepare_parent = (next_: Iterator<[string, string]>, token: [string, string]) => function* select(context: _SelectorContext, result: IterableIterator<Element>) {
   // FIXME: throw error if .. is applied at toplevel?
   const parent_map = get_parent_map(context)
   const result_map = new Set()
   for (const elem of result)
      if (parent_map.has(elem)) {
         const parent = parent_map.get(elem) as Element
         if (!result_map.has(parent)) {
            result_map.add(parent)
            yield parent
         }
      }
}

// wow what spaghetti, but first
/**
 * Internal utility for this TS port
 * char happens to equal code_point
 * repr cuz why not
 **/
const __char_to_int = (char: string) => {
   const result = "0123456789".indexOf(char)
   if (result === -1) {
      throw ValueError(`(XPath something was not digit) Invalid literal for int() with base 10: ${repr(char)}`)
   }
   return result
}

const prepare_predicate: typeof prepare_descendant = (next_: Iterator<[string, string]>, token: [string, string]) => {
   // FIXME: replace with real parser!!! refs:
   // http://javascript.crockford.com/tdop/tdop.html
   const signature_ = []
   const predicate = []
   while (true) {
      try {
         token = next(next_)
      } catch (err) {
         if (err instanceof StopIteration) return
         else throw err
      }

      if (token[0] === "]")
         break
      if (token[0] === '' && token[1] === '')
         // ignore whitespace
         continue
      if (token[0] && "'\"".includes(token[0][0]))
         token = ["'", token[0].slice(1, -1)]
      signature_.push(token[0] || "-")
      predicate.push(token[1])
   }
   const signature = signature_.join("")
   // use signature to determine predicate type
   if (signature === "@-") {
      // [@attribute] predicate
      const key = predicate[1]
      return __prepare_select(elem => elem.get(key) !== None)
   }
   if (signature === "@-='" || signature === "@-!='") {
      // [@attribute='value'] or [@attribute!='value']
      const key = predicate[1]
      const value = predicate.at(-1)
      if (signature === "@-!='")
         return __prepare_select(elem => (elem.get(key) ?? value) !== value)
      else
         return __prepare_select(elem => elem.get(key) === value)
   }
   if (signature === "-" && !/\-?\d+$/.test(predicate[0])) {
      // [tag]
      const tag = predicate[0]
      return __prepare_select(elem => elem.find(tag) !== None)
   }
   if (signature === ".='" || signature === ".!='" || (
         (signature === "-='" || signature === "-!='")
          && !/\-?\d+$/.test(predicate[0]))) {
      // [.='value'] or [tag='value'] or [.!='value'] or [tag!='value']
      const tag = predicate[0]
      const value = predicate.at(-1)
      const select: __Selector = tag
         ? __prepare_select(elem => [...elem.findall(tag)].some(e => e.itertext().join("") === value))
         : __prepare_select(elem => [...elem.itertext()].join("") === value)
      const select_negated: __Selector = tag
         ? __prepare_select(elem => [...elem.iterfind(tag)].some(e => e.itertext().join("") !== value))
         : __prepare_select(elem => [...elem.itertext()].join("") !== value)
      return signature.includes('!=') ? select_negated : select
   }
   if (signature === "-" || signature === "-()" || signature === "-()-") {
      // [index] or [last()] or [last()-index]
      const tag = predicate[0]
      let index: number;
      if (signature === "-") {
         // [index]
         index = __char_to_int(predicate[0]) - 1
         if (index < 0)
            throw SyntaxError("XPath position >= 1 expected")
      } else {
         if (predicate[0] != "last")
            throw SyntaxError("unsupported function")
         if (signature == "-()-") {
            try {
               index = __char_to_int(predicate[2]) - 1
            } catch (err) {
               if (err instanceof ValueError) throw SyntaxError("unsupported expression", { cause: err })
               throw err
            }
            if (index > -2)
               throw SyntaxError("XPath offset from last() must be negative")
         } else
            index = -1
      }

      return function* select(context: _SelectorContext, result: IterableIterator<Element>) {
         const parent_map = get_parent_map(context) as Map<Element, Element>
         for (const elem of result) {
            try {
               const parent: Element | undefined = parent_map.get(elem)
               if (parent === undefined)
                  throw KeyError()
               // FIXME: what if the selector is "*" ?
               //
               // ```py
               // import xml.etree.ElementTree as ET
               // c = ET.Element('1')
               // c.append(ET.Comment('2')) // comment's parent is now c
               // print(c.find("*[3]")) // the star causes "Comment" to be selected, so result is ~[Comment], and so c.findall(Comment) -> TypeError
               // ```
               // @ts-expect-error -- I now know everything about this FIXME (it's non * specific)
               const elems = [...parent.findall(elem.tag)]
               if (!(index in elems))
                  throw IndexError()
               if (elems[index] === elem)
                  yield elem
            } catch (err) {
               if (err instanceof IndexError || err instanceof KeyError) continue/* ignore */;
               throw err
            }
         }
      } as __Selector
   }
   throw SyntaxError("invalid predicate")
}

const ops = {
   "": prepare_child,
   "*": prepare_star,
   ".": prepare_self,
   "..": prepare_parent,
   "//": prepare_descendant,
   "[": prepare_predicate,
} as const

// Internal TS type
type __op = ReturnType<typeof ops[keyof typeof ops]>

const _cache = new Map<[string, [string, string][]], __op[]>()

/** Internal utility for this TS port */
const _cache_get = (path: string, namespaces: Map<string, string>) => {
   for (const [[keypath, keynames], value] of _cache) {
      if (path === keypath && keynames.length === namespaces.size && keynames.every(name => namespaces.get(name[0]) === name[1])) {
         return value
      }
   }
   return None
}

class _SelectorContext {
   public parent_map: Map<Element, Element> | None = None
   constructor (public root: Element) {}
}

// --------------------------------------------------------------------

////
// Generate all matching objects.

export const iterfind = (elem: Element, path: string, namespaces: Map<string, string> | None = None) => {
   // compile selector pattern
   if (path.endsWith("/"))
      path += "*" // implicit all (FIXME: keep this?)

   // An array of selectors
   let selector: __op[];

   const _cache_try = namespaces ? _cache_get(path, namespaces) : None
   if (_cache_try === None) {
      if (_cache.size > 100)
         _cache.clear()
      if (path[0] === "/") {
         throw SyntaxError("cannot use absolute path on element")
      }

      const next_ = xpath_tokenizer(path, namespaces)
      let token: [string, string];
      try {
         token = next(next_)
      } catch (err) {
         if (err instanceof StopIteration) return
         else throw err
      }

      selector = []
      InfiniteLoop: while (true) {
         try { // @ts-expect-error -- it is a security error but this is only run on trusted data
            selector.push(ops[token[0]](next_, token))
         } catch (err) {
            if (err instanceof StopIteration) throw SyntaxError("invalid path")
            else throw err
         }
         try {
            token = next(next_)
            if (token[0] === "/")
               token = next(next_)
         } catch (err) {
            if (err instanceof StopIteration) break InfiniteLoop;
            else throw err
         }
      }

      const sorted_namespaces = namespaces ? [...namespaces].sort() : []
      _cache.set([path, sorted_namespaces], selector)
   } else {
      selector = _cache_try
   }
   // execute selector pattern
   const context = new _SelectorContext(elem)
   // Hack so that next([elem]) === elem
   const start_ = [elem]
   const start = Object.assign(start_, start_[Symbol.iterator]()) // @ts-expect-error -- intentional in the way it is intentional in python, 1
   return selector.reduce((result: typeof start | Generator<Element, void, unknown>, select) => select(context, result), start)
}

////
// Find first matching object.

export const find = (elem: Element, path: string, namespaces: Map<string, string> | None = None) => // @ts-expect-error -- intentional in the way it is intentional in python, 2
   next(iterfind(elem, path, namespaces), None)

////
// Find all matching objects.

export const findall = (elem: Element, path: string, namespaces: Map<string, string> | None = None) => // @ts-expect-error -- intentional in the way it is intentional in python, 3
   [...iterfind(elem, path, namespaces)]

////
// Find text for first matching object.

export const findtext = (elem: Element, path: string, default_ = None, namespaces: Map<string, string> | None = None) => {
   try { // @ts-expect-error -- intentional in the way it is intentional in python, 4
      elem = next(iterfind(elem, path, namespaces))
      if (elem.text === None)
         return ""
      return elem.text
   } catch (err) {
      if (err instanceof StopIteration) return default_
      else throw err
   }
}
