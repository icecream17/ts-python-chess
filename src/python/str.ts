/**
 * This is a very deep rabbit hole isn't it.
 *
 * Call site: https://github.com/python/cpython/blob/146f168fbf5b239158922f4defd494088c381525/Objects/unicodeobject.c#L12036
 * What actually matters: https://github.com/python/cpython/blob/146f168fbf5b239158922f4defd494088c381525/Tools/unicode/makeunicodedata.py#L449
 */
const Py_UNICODE_ISPRINTABLE = (code_point: string) =>
   code_point === " " || !(/\P{C}/.test(code_point) || /\P{Z}/.test(code_point))

/** Internal convenience function for this TS port */
const _hex_code_point = (code_point: string, length: number) =>
   code_point.codePointAt(0)!.toString(16).padStart(length, '0')

// Style inconsistency: Using single quote by default here
/**
 * The `__repr__` method of Python's `str`, ported to TypeScript.
 *
 * As seen in https://github.com/python/cpython/blob/146f168fbf5b239158922f4defd494088c381525/Objects/unicodeobject.c#L12002
 */
export const __repr__ = (str: string) => {
   // Currently it turns out that osize and max do nothing
   // so this function is vastly simplified
   let unchanged = true
   let squote = 0
   let dquote = 0
   // [Symbol.iterator] happens to loop over code points!
   // Note: Despite the naming in the link above, the loop iterates over code
   // points, not characters.
   for (const code_point of str) {
      // Note: Copy paste formatting, except JS's === sigh
      switch (code_point) {
         case "'": squote++; break;
         case '"': dquote++; break;
         case '\\': case '\t': case '\r': case '\n':
            unchanged = false;
            break;
         default:
            /* Fast-path ASCII */
            if (code_point < ' ' || code_point === '\x7f') // [less than note]
               unchanged = false; /* \xHH */
            else if (code_point < '\x7f') /** @ts-expect-error */
               ;
            else if (Py_UNICODE_ISPRINTABLE(code_point)) /** @ts-expect-error */
               ;
            else
               unchanged = false; // Convenient simplification
      }
      // Don't need to check for String size overflow error because:
      // - It would take detecting if the platform was 32-bit or 64-bit
      // - The error is so unlikely, I feel like only malicious code could
      // - JS already has string size limits, so it would error anyway
      // - Browsers limit string sizes even more
   }

   // Even more copy paste formatting
   let quote = "'";
   if (squote) {
      unchanged = false;
      if (!dquote)
         quote = '"';
   }

   if (unchanged) {
      return quote + str + quote // That moment when `${}` is inefficient
   } else {
      let repr = quote
      for (const code_point of str) {
         /* Escape quotes and backslashes */
         if (code_point === quote || code_point === '\\') {
            repr += '\\'
            repr += code_point
         }

         /* Map special whitespace to '\t', '\n', '\r' */
         else if (code_point === '\t') {
            repr += '\\t'
         } else if (code_point === '\n') {
            repr += '\\n'
         } else if (code_point === '\r') {
            repr += '\\r'
         }

         /* Map non-printable US ASCII to '\xhh' */
         else if (code_point < ' ' || code_point === '\x7f') {
            repr += '\\x'
            repr += _hex_code_point(code_point, 2)
         }

         /* Copy ASCII characters as-is */
         else if (code_point < '\x7f') {
            repr += code_point
         }

         /* Non-ASCII characters */
         else {
            /* I flipped the if */
            /* Copy characters as-is */
            if (Py_UNICODE_ISPRINTABLE(code_point)) {
               repr += code_point
            }
            /* Map Unicode whitespace and control characters
               (categories Z* and C* except ASCII space)
            */
            else {
               repr += '\\'
               /* Map 8-bit characters to '\xhh' */
               if (code_point <= '\xff') {
                  repr += 'x'
                  repr += _hex_code_point(code_point, 2)
               }
               /* Map 16-bit characters to '\uxxxx' */
               else if (code_point.length === 1) { // JS is UTF-16
                  repr += 'u'
                  repr += _hex_code_point(code_point, 4)
               }
               /* Map 21-bit characters to '\U00xxxxxx' */
               else {
                  repr += 'U'
                  repr += _hex_code_point(code_point, 8)
               }
            }
         }
      }

      return repr + quote
   }
}

/**
 * [less than note]
 * JavaScript's less than, instead of comparing code points, compares code units.
 * Remember that JS uses UTF-16, that means a code point may be multiple code units.
 * So '\u{10000}' < '\uFFFF'.
 *
 * But... why is '\x02' < '\u{10000}'?
 * Because '\u{10000}' is a surrogate pair!
 *    '\uD800\uDC00' === '\u{10000}'
 *
 * A quick search shows that Unicode can support at most 1_114_112 code points.
 * This is the number of elements in the range 0..0x10FFFF.
 *
 * This code sorts all code points by `<` and verifies that the first 128
 * are not surrogate pairs, thus verifying that the less than would work.
 *
 * In fact, it works up until 0xD800
 *
 * ```
 * let a = []
 * for (let i = 0; i <= 0x10FFFF; i++) {
 *    a.push(String.fromCharCode(i))
 * }
 * a.sort()
 *
 * for (let i = 0; i < 0xD800; i++) {
 *    console.assert(a[i].length === 1)
 * }
 *
 * // Note: '\uD800' < '\u{10000}' because it's shorter
 * ```
 */

// I'm too lazy to write tests
// __repr__("\\") === "'\\\\'"
// __repr__('"q"') === `'"q"'`
// __repr__("abc's") === `"abc's"`
// __repr__("\x00") === "'\\x00'"
// __repr__("Σ") === "'Σ'"
// __repr__("\u{10000}") === "'\\U0010000'"
