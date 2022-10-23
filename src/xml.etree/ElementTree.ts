/**
 * @overview Lightweight XML support for Python, ported to TypeScript.
 *
 * XML is an inherently hierarchical data format, and the most natural way to
 * represent it is with a tree.  This module has two classes for this purpose:
 *
 *    1. ElementTree represents the whole XML document as a tree and
 *
 *    2. Element represents a single node in this tree.
 *
 * Interactions with the whole document (reading and writing to/from files) are
 * usually done on the ElementTree level.  Interactions with a single XML element
 * and its sub-elements are done on the Element level.
 *
 * Element is a flexible container object designed to store hierarchical data
 * structures in memory. It can be described as a cross between a list and a
 * dictionary.  Each Element has a number of properties associated with it:
 *
 *    'tag' - a string containing the element's name.
 *
 *    'attributes' - a Python dictionary storing the element's attributes.
 *
 *    'text' - a string containing the element's text content.
 *
 *    'tail' - an optional string containing text after the element's end tag.
 *
 *    And a number of child elements stored in a Python sequence.
 *
 * To create an element instance, use the Element constructor,
 * or the SubElement factory function.
 *
 * You can also use the ElementTree class to wrap an element structure
 * and convert it to and from XML.
 *
 */

// Yes you can export before import, and plus I'm preserving the Python implementation ordering
export const VERSION = "1.3.0"

import { None, NumericIndex } from "../../types/types"
import { id, repr, type, NotImplementedError, ValueError, FutureWarning } from "../python/builtin"
import { contextmanager } from "../python/contextlib"
import { isinstance_str } from "../utils/objects"
import * as ElementPath from "./ElementPath"

// https://docs.python.org/3/license.html says that it is GPL compatible
// and that I should put:
//
// Copyright © 2001-2022 Python Software Foundation; All Rights Reserved

//  v Sidenote
//  v I fixed the hyphen
//  v https://github.com/python/cpython/blob/bf786e6901934a7c25cb0aa6b7d42a1677f02300/Lib/xml/etree/ElementTree.py#L36
//  v
//  v I didn't make a pull request because
//  v https://devguide.python.org/getting-started/pull-request-lifecycle/#pullrequest
//  v says that changes only about formatting are usually rejected,
//  v so for now you're just living with the cursed knowledge of that extra hyphen.

// # --------------------------------------------------------------------
// # Licensed to PSF under a Contributor Agreement.
// # See https://www.python.org/psf/license for licensing details.
// #
// # ElementTree
// # Copyright (c) 1999-2008 by Fredrik Lundh.  All rights reserved.
// #
// # fredrik@pythonware.com
// # http://www.pythonware.com
// # --------------------------------------------------------------------
// # The ElementTree toolkit is
// #
// # Copyright (c) 1999-2008 by Fredrik Lundh
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

/**
 * An error when parsing an XML document.
 *
 * In addition to its exception value, a ParseError contains
 * two extra attributes:
 *     'code'     - the specific exception code
 *     'position' - the line and column of the error
 */
export class ParseError extends SyntaxError {
   public code!: string
   public position!: [number, number]

   constructor (...args) {
      super(...args)
      this.name = this.constructor.name
   }
}

/** Return True if *element* appears to be an Element. */
export const iselement = (element: {}) => "tag" in element

/** Internal type for this TS port, also short for `__ElementTag | XPath` */
type __ElementTag = string | None | typeof Comment | typeof ProcessingInstruction

/**
 * An XML element.
 * This class is the reference implementation of the Element interface.
 *
 * An element's length is its number of subelements.  That means if you
 * want to check if an element is truly empty, you should check BOTH
 * its length AND its text attribute.
 *
 * The element tag, attribute names, and attribute values can be either
 * bytes or strings.
 *
 * *tag* is the element name.  *attrib* is an optional dictionary containing
 * element attributes. *extra* are additional element attributes given as
 * keyword arguments.
 *
 * Example form:
 *     `<tag attrib>text<child/>...</tag>tail`
 */
export class Element extends Array<Element> {
   /** Dictionary of the element's attributes */
   public attrib: Map<string, string>

   /**
    * Text before first subelement. This is either a string or the value None.
    * Note that if there is no text, this attribute may be either
    * None or the empty string, depending on the parser.
    */
   public text: string | None = None

   /**
    * Text after this element's end tag, but before the next sibling element's
    * start tag.  This is either a string or the value None.  Note that if there
    * was no text, this attribute may be either None or an empty string,
    * depending on the parser.
    */
   public tail: string | None = None

   // Hack
   private _children: Element

   constructor (
      /** The element's name */
      public tag: __ElementTag = None,
      attrib: Iterable<[string, string]> = [],
      extra: Iterable<[string, string]> = [],
   ) {
      // Instead of bothering with Proxy and __methods__, just subclass Array
      super()

      // There's not really a dictionary type, so just check if it's an Object
      if (attrib !== Object(attrib)) {
         throw TypeError(`attrib must be dict, not ${type(attrib).name}`)
      }

      // I'm using Object as dictionary which is very unsafe
      this.attrib = new Map([...attrib, ...extra])
      this._children = this // lol
   }

   __repr__() {
      return `<${this.constructor.name} ${repr(this.tag)} at 0x${id(self).toString(16)}>`
   }

   /**
    * Create a new element with the same type.
    * *tag* is a string containing the element name.
    * *attrib* is a dictionary containing the element attributes.
    * Do not call this method, use the SubElement factory function instead.
    */
   makeelement(tag: __ElementTag, attrib: Map<string, string>) {// @ts-expect-error -- it is
      return new this.constructor(tag, attrib) as InstanceType<this>
   }

   __copy__() {
      const elem = this.makeelement(this.tag, this.attrib)
      elem.text = this.text
      elem.tail = this.tail
      elem.push(...this)
      return elem
   }

   // This is getting ridiculous
   __len__() {
      return this.length
   }

   // No way to emulate __bool__ without breaking something else

   // __getitem__ doesn't need to be implemented

   // Again, no proxy, so no __setitem__

   // __delitem__ doesn't need to be implemented

   /**
    * Add *subelement* to the end of this element.
    *
    * The new element will appear in document order after the last existing
    * subelement (or directly after the text, if it's the first subelement),
    * but before the end tag for this element.
    */
   append(subelement: unknown | Element) {
      this._assert_is_element(subelement)
      this.push(subelement)
   }

   /**
    * Append subelements from a sequence.
    *
    * *elements* is a sequence with zero or more elements.
    */
   extend(elements: Iterable<unknown | Element>) {
      for (const element of elements) {
         this._assert_is_element(element)
         this.push(element)
      }
   }

   /** Insert *subelement* at position *index* */
   insert(subelement: unknown | Element, index: number) {
      this._assert_is_element(subelement)
      this.splice(index, 0, subelement)
   }

   _assert_is_element(e: unknown): asserts e is Element {
      // Need to refer to the actual Python implementation, not the
      // shadowing C implementation
      if (!(e instanceof _Element_Py))
         throw TypeError(`expected an Element, not ${e}`)
   }

   /**
    * Remove matching subelement.
    *
    * Unlike the find methods, this method compares elements based on
    * identity, NOT ON tag value or contents.  To remove subelements by
    * other means, the easiest way is to use a list comprehension to
    * select what elements to keep, and then use slice assignment to update
    * the parent element.
    *
    * ValueError is raised if a matching element could not be found.
    */
   remove<T>(subelement: T): T extends Element ? T : never {
      // assert iselement(element)
      const index = this.indexOf(subelement)
      if (index === -1) {
         throw ValueError("list.remove(x): x not in list")
      } // @ts-expect-error -- https://github.com/microsoft/TypeScript/issues/33912
      return this[index]
   }

   /**
    * Find first matching element by tag name or path.
    *
    * *path* is a string having either an element tag or an XPath,
    * *namespaces* is an optional mapping from namespace prefix to full name.
    *
    * Return the first matching element, or None if no element was found.
    */ // @ts-expect-error -- intentional
   override find(path: string, namespaces: Map<string, string> | None = None) {
      return ElementPath.find(this, path, namespaces)
   }

   /**
    * Find text for first matching element by tag name or path.
    *
    * *path* is a string having either an element tag or an XPath,
    * *default* is the value to return if the element was not found,
    * *namespaces* is an optional mapping from namespace prefix to full name.
    *
    * Return text content of first matching element, or default value if
    * none was found.  Note that if an element is found having no text
    * content, the empty string is returned.
    */
   findtext(path: string, default_ = None, namespaces: Map<string, string> | None = None) {
      return ElementPath.findtext(this, path, default_, namespaces)
   }

   /**
    * Find all matching subelements by tag name or path.
    *
    * *path* is a string having either an element tag or an XPath,
    * *namespaces* is an optional mapping from namespace prefix to full name.
    * Returns list containing all matching elements in document order.
    */
   findall(path: string, namespaces: Map<string, string> | None = None) {
      return ElementPath.findall(this, path, namespaces)
   }

   /**
    * Find all matching subelements by tag name or path.
    *
    * *path* is a string having either an element tag or an XPath,
    * *namespaces* is an optional mapping from namespace prefix to full name.
    * Return an iterable yielding all matching elements in document order.
    */
   iterfind(path: string, namespaces: Map<string, string> | None = None) {
      return ElementPath.iterfind(this, path, namespaces)
   }

   /**
    * Reset element.
    *
    * This function removes all subelements, clears all attributes, and sets
    * the text and tail attributes to None.
    */
   clear() {
      this.attrib.clear()
   }

   /**
    * Get element attribute.
    *
    * Equivalent to attrib.get, but some implementations may handle this a
    * bit more efficiently.  *key* is what attribute to look for, and
    * *default* is what to return if the attribute was not found.
    *
    * Returns a string containing the attribute value, or the default if
    * attribute was not found.
    */
   get<T>(key: string, default_: T | None = None) {
      return this.attrib.get(key) ?? default_
   }

   /**
    * Set element attribute.
    *
    * Equivalent to attrib[key] = value, but some implementations may handle
    * this a bit more efficiently.  *key* is what attribute to set, and
    * *value* is the attribute value to set it to.
    */
   set(key: string, value: string) {
      this.attrib.set(key, value)
   }

   /**
    * Get list of attribute names.
    *
    * Names are returned in an arbitrary order, just like an ordinary
    * Python dict.  Equivalent to attrib.keys()
    */ // @ts-expect-error -- intentional
   override keys() {
      return this.attrib.keys()
   }

   /**
    * Get element attributes as a sequence.
    *
    * The attributes are returned in arbitrary order.  Equivalent to
    * attrib.items().
    *
    * Return a list of (name, value) tuples.
    */
   items() {
      return [...this.attrib]
   }

   /**
    * Create tree iterator.
    *
    * The iterator loops over the element and all subelements in document
    * order, returning all elements with a matching tag.
    *
    * If the tree structure is modified during iteration, new or removed
    * elements may or may not be included.  To get a stable set, use the
    * list() function on the iterator, and loop over the resulting list.
    *
    * *tag* is what tags to look for (default is to return all elements)

    * Return an iterator containing all the matching elements.
    */
   * iter(tag: string | None = None): Generator<Element, void, unknown> {
      if (tag === "*")
         tag = None
      if (tag === None || this.tag === tag)
         yield this
      for (const e of this)
         yield* e.iter(tag)
   }

   /**
    * Create text iterator.
    * The iterator loops over the element and all subelements in document
    * order, returning all inner text.
    */
   * itertext(): Generator<string, void, unknown> {
      const tag = this.tag // @ts-expect-error -- It doesn't error so it doesn't have to
      if (!isinstance_str(tag) && tag !== None)
         return
      if (this.text)
         yield this.text
      for (const e of this) {
         yield* e.itertext()
         if (e.tail)
            yield e.tail
      }
   }
}

/**
 * """Subelement factory which creates an element instance, and appends it
 * to an existing parent.
 * The element tag, attribute names, and attribute values can be either
 * bytes or Unicode strings.
 * *parent* is the parent element, *tag* is the subelements name, *attrib* is
 * an optional directory containing element attributes, *extra* are
 * additional attributes given as keyword arguments.
 */
function SubElement(parent: Element, tag: string, attrib: Iterable<[string, string]> = [], extra: Iterable<[string, string]> = []) {
   attrib = [...attrib, ...extra]
   const element = parent.makeelement(tag, attrib)
   parent.append(element)
   return element
}

/**
 * Comment element factory.
 * This function creates a special element which the standard serializer
 * serializes as an XML comment.
 * *text* is a string containing the comment string.
 */
export function Comment(text: string | None = None) {
   const element = new Element(Comment)
   element.text = text
   return element
}

/**
 * Processing Instruction element factory.
 *
 * This function creates a special element which the standard serializer
 * serializes as an XML comment.
 *
 * *target* is a string containing the processing instruction, *text* is a
 * string containing the processing instruction contents, if any.
 */
export function ProcessingInstruction(target: string, text: string | None = None) {
   const element = new Element(ProcessingInstruction)
   element.text = text ? `${target} ${text}` : target
   return element
}

/**
 * Qualified name wrapper.
 *
 * This class can be used to wrap a QName attribute value in order to get
 * proper namespace handing on output.
 *
 * *text_or_uri* is a string containing the QName value either in the form
 * {uri}local, or if the tag argument is given, the URI part of a QName.
 *
 * *tag* is an optional argument which if given, will make the first
 * argument (text_or_uri) be interpreted as a URI, and this argument (tag)
 * be interpreted as a local name.
 */ // Similarly, just extend String
export class QName extends String {
   public text: string;
   constructor (text_or_uri: string, tag: string | None = None) {
      if (tag)
         text_or_uri = `{${text_or_uri}}${tag}`
      super(text_or_uri)
      this.text = this
   }

   toString() {
      return this.text
   }

   __repr__() {
      return `<${this.constructor.name} ${repr(this.text)}>`
   }
}

/**
 * An XML element hierarchy.
 *
 * This class also provides support for serialization to and from
 * standard XML.
 *
 * *element* is an optional root element node,
 * *file* is an optional file handle or file name of an XML file whose
 * contents will be used to initialize the tree with.
 */
export class ElementTree {
   private _root: Element
   constructor (element: Element | None = None, file: unknown = None) {
      // assert element is None or iselement(element)
      this._root = element // first node
      if (file)
         this.parse(file)
   }

   /** Return root element of this tree */
   getroot () {
      return this._root
   }

   /**
    * Replace root element of this tree.
    *
    * This will discard the current contents of the tree and replace it
    * with the given element.  Use with care!
    */
   _setroot (element: Element) {
      // assert iselement(element)
      this._root = element
   }

   /**
    * Load external XML document into element tree.
    *
    * *source* is a file name or file object, *parser* is an optional parser
    * instance that defaults to XMLParser.
    *
    * ParseError is raised if the parser fails to parse the document.
    *
    * Returns the root element of the given source document.
    */
   parse(source: unknown, parser: unknown = None) {
      throw NotImplementedError("File related operations are not implemented (TS port)")
   }

   /**
    * Create and return tree iterator for the root element.
    *
    * The iterator loops over all elements in this tree, in document order.
    * *tag* is a string with the tag name to iterate over
    * (default is to return all elements).
    */
   iter(tag: string | None = None) {
      // assert self._root is not None
      return this._root.iter(tag)
   }

   /**
    * Find first matching element by tag name or path.
    *
    * Same as getroot().find(path), which is Element.find()
    *
    * *path* is a string having either an element tag or an XPath,
    * *namespaces* is an optional mapping from namespace prefix to full name.
    *
    * Return the first matching element, or None if no element was found.
    */
   find (path: __ElementTag, namespaces: Map<string, string>) {
      // assert self._root is not None
      if (path[0] === "/") {
         path = "." + path
         console.warn(new FutureWarning(
            `This search is broken in 1.3 and earlier, and will be ` +
            `fixed in a future version.  If you rely on the current ` +
            `behaviour, change it to ${path}`
         ))
      }
      return this._root.find(path, namespaces)
   }

   /**
    * Find first matching element by tag name or path.
    *
    * Same as getroot().findtext(path), which is Element.findtext()
    *
    * *path* is a string having either an element tag or an XPath,
    * *namespaces* is an optional mapping from namespace prefix to full name.
    *
    * Return the first matching element, or None if no element was found.
    */
   findtext (path: __ElementTag, namespaces: Map<string, string>) {
      // assert self._root is not None
      if (path[0] === "/") {
         path = "." + path
         console.warn(new FutureWarning(
            `This search is broken in 1.3 and earlier, and will be ` +
            `fixed in a future version.  If you rely on the current ` +
            `behaviour, change it to ${path}`
         ))
      }
      return this._root.findtext(path, namespaces)
   }

   /**
    * Find all matching subelements by tag name or path.
    *
    * Same as getroot().findall(path), which is Element.findall()
    *
    * *path* is a string having either an element tag or an XPath,
    * *namespaces* is an optional mapping from namespace prefix to full name.
    *
    * Return list containing all matching elements in document order.
    */
   findall (path: __ElementTag, namespaces: Map<string, string>) {
      // assert self._root is not None
      if (path[0] === "/") {
         path = "." + path
         console.warn(new FutureWarning(
            `This search is broken in 1.3 and earlier, and will be ` +
            `fixed in a future version.  If you rely on the current ` +
            `behaviour, change it to ${path}`
         ))
      }
      return this._root.findall(path, namespaces)
   }

   /**
    * Find all matching subelements by tag name or path.
    *
    * Same as getroot().iterfind(path), which is Element.iterfind()
    *
    * *path* is a string having either an element tag or an XPath,
    * *namespaces* is an optional mapping from namespace prefix to full name.
    *
    * Return iterable yielding all matching elements in document order.
    */
   iterfind (path: __ElementTag, namespaces: Map<string, string>) {
      // assert self._root is not None
      if (path[0] === "/") {
         path = "." + path
         console.warn(new FutureWarning(
            `This search is broken in 1.3 and earlier, and will be ` +
            `fixed in a future version.  If you rely on the current ` +
            `behaviour, change it to ${path}`
         ))
      }
      return this._root.iterfind(path, namespaces)
   }

   /**
    * Write element tree to a file as XML.
    * Arguments:
    *   *file_or_filename* -- file name or a file object opened for writing
    *   *encoding* -- the output encoding (default: US-ASCII)
    *   *xml_declaration* -- bool indicating if an XML declaration should be
    *                        added to the output. If None, an XML declaration
    *                        is added if encoding IS NOT either of:
    *                        US-ASCII, UTF-8, or Unicode
    *   *default_namespace* -- sets the default XML namespace (for "xmlns")
    *   *method* -- either "xml" (default), "html, "text", or "c14n"
    *   *short_empty_elements* -- controls the formatting of elements
    *                             that contain no content. If True (default)
    *                             they are emitted as a single self-closed
    *                             tag, otherwise they are emitted as a pair
    *                             of start/end tags
    */
   write(
      file_or_filename: unknown,
      encoding: string | None = None,
      xml_declaration: bool | None = None,
      default_namespace: unknown = None,
      method: "xml" | "html" | "text" | "c14n" = "xml",
      short_empty_elements: boolean = true
   ) {
      throw NotImplementedError("Todo: _get_writer, _namespaces, _serialize (TS port)")
   }

   write_c14n(file: unknown) {
      // lxml.etree compatibility.  use output method instead
      return self.write(file, None, None, None, "c14n")
   }
}

const _get_writer = contextmanager((file_or_filename, encoding: string) => {
   let write;
   if ("write" in (file_or_filename ?? "")) {
      write = file_or_filename.write
   } else {
      // file_or_filename is a file name
      throw NotImplementedError("Filesystem operations are not implemented (TS port)")
   }

   // file_or_filename is a file-like object
   // encoding determines if it is a text or binary writer
   if (encoding.toLowerCase() === "unicode") {
      yield [write, file_or_filename.encoding || "utf-8"]
   } else {
      throw NotImplementedError("Todo: io.BytesIO io.BufferedIOBase (TS port)")
   }
})

// ----------------------------------------------------------------------------
// Don't bother with C accelerators

const _Element_Py = Element
