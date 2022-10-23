/**
 * The io module provides the Python interfaces to stream handling. The
 * builtin open function is defined in this module.
 *
 * At the top of the I/O hierarchy is the abstract base class IOBase. It
 * defines the basic interface to a stream. Note, however, that there is no
 * separation between reading and writing to streams implementations are
 * allowed to raise an OSError if they do not support a given operation.
 *
 * Extending IOBase is RawIOBase which deals simply with the reading and
 * writing of raw bytes to a stream. FileIO subclasses RawIOBase to provide
 * an interface to OS files.
 *
 * BufferedIOBase deals with buffering on a raw byte stream (RawIOBase). Its
 * subclasses, BufferedWriter, BufferedReader, and BufferedRWPair buffer
 * streams that are readable, writable, and both respectively.
 * BufferedRandom provides a buffered interface to random access
 * streams. BytesIO is a simple stream of in-memory bytes.
 *
 * Another IOBase subclass, TextIOBase, deals with the encoding and decoding
 * of streams into text. TextIOWrapper, which extends it, is a buffered text
 * interface to a buffered raw stream (`BufferedIOBase`). Finally, StringIO
 * is an in-memory stream for text.
 *
 * Argument names are not part of the specification, and only the arguments
 * of open() are intended to be used as keyword arguments.
 *
 * data:
 *
 * DEFAULT_BUFFER_SIZE
 *
 *    An int containing the default buffer size used by the module's buffered
 *    I/O classes. open() uses the file's blksize (as obtained by os.stat) if
 *    possible.
 */
import { OSError, NotImplementedError } from "./builtin"
import { None } from "../types/types"
import { make_callable } from "../utils/objects"

/** Note: Only one prototype and only one extends */
export const UnsupportedOperation = make_callable(class UnsupportedOperation extends OSError { })
UnsupportedOperation.__module__ = "io"

type WritableBuffer<T> = {
   length: number
   [n: number]: T
}

type ReadableBuffer<T> = WritableBuffer<T> | {
   readonly length: number
   readonly [n: number]: T
}

type _Bytes<T, S extends _Bytes<T, S>> = WritableBuffer<T> & Iterable<T> & {
   slice(start: number, end?: number): S;
}

// # New I/O library conforming to PEP 3116.

// This is a TS port of https://github.com/python/cpython/blob/main/Lib/io.py
// and https://github.com/python/cpython/tree/main/Modules/_io
// Copyright © 2001-2022 Python Software Foundation; All Rights Reserved

export const SEEK_SET = 0
export const SEEK_CUR = 1
export const SEEK_END = 2

export abstract class IOBase<Byte, Bytes extends _Bytes<Byte, Bytes>> {
   /** Implement iter(self) */
   abstract __iter__ (): Iterator<Bytes>

   /** Implement next(self) */
   abstract __next__ (): Bytes

   abstract __enter__ (): this

   __exit__ () {
      this.close()
   }

   // Note from docs.python.org but not __doc__:

   // Even though `IOBase` does not declare `read()` or `write()` because
   // their signatures will vary, implementations and clients should still
   // consider those methods part of the interface

   abstract read (...args: any): any
   abstract write (...args: any): any

   /**
    * Flush and close the IO object.
    *
    * This has no effect if the file is already closed.
    */
   abstract close (): void

   abstract closed: boolean

   /**
    * Returns underlying file descriptor if one exists.
    *
    * OSError is raised if the IO object does not use a file descriptor.
    */
   abstract fileno (): number

   /**
    * Flush write buffers, if applicable.
    *
    * This is not implemented for read-only and non-blocking streams.
    */
   abstract flush (): void

   /**
    * Return whether this is an 'interactive' stream.
    *
    * Return False if it can't be determined.
    */
   abstract isatty (): boolean

   /**
    * Return whether object was opened for reading.
    *
    * If False, read() will raise OSError.
    */
   abstract readable (): boolean

   // These abstract methods have default values:
   // size = -1
   // hint = -1
   // whence = SEEK_SET
   // size = None

   /**
    * Read and return a line from the stream.
    *
    * If size is specified, at most size bytes will be read.
    *
    * The line terminator is always b'\n' for binary files;
    * for text files, the newlines argument to open can be used to select the
    * line terminator(s) recognized
    */
   abstract readline (size?: number | undefined): Bytes

   /**
    * Return a list of lines from the stream.
    *
    * hint can be specified to control the number of lines read:
    * no more lines will be read if the total size (in bytes/characters)
    * of all lines so far exceeds hint.
    */
   abstract readlines (hint?: number | undefined): Bytes[]

   /**
    * Change stream position.
    *
    * Change the stream position to the given byte offset.
    * The offset is interpreted relative to the position indicated by whence.
    * Values for whence are:
    *
    * * 0 -- start of stream (the default); offset should be zero or positive
    * * 1 -- current stream position; offset may be negative
    * * 2 -- end of stream; offset is usually negative
    *
    * Return the new absolute position.
    */
   abstract seek (offset: number, whence?: number | undefined): number

   /**
    * Return whether the object supports random access.
    *
    * If False, seek(), tell() and truncate() will raise OSError.
    * This method may need to do a test seek().
    */
   abstract seekable (): boolean

   /** Return current stream position */
   abstract tell (): number

   /**
    * Truncate file to size bytes.
    *
    * File pointer is left unchanged, Size defaults to the current
    * IO position as reported by tell. Returns the new size.
    */
   abstract truncate (size?: number | undefined): number

   /**
    * Return whether object was opened for writing.
    *
    * If False, write() will raise OSError.
    */
   abstract writable (): boolean

   /** Write a list of lines to the stream */
   abstract writelines (lines: Iterable<ReadableBuffer<Byte>>): void

   abstract __del__ (): void
}

export abstract class RawIOBase<Byte, Bytes extends _Bytes<Byte, Bytes>> extends IOBase<Byte, Bytes> {
   // Implementation field, not API
   private unreturnedBytes!: Bytes

   // Read up to size bytes from the object and return them. As a convenience,
   // if size is unspecified or -1, all bytes until EOF are returned.
   // Otherwise, only one system call is ever made.
   // Fewer than size bytes may be returned if the operating system call
   // returns fewer than size bytes.
   //
   // If 0 bytes are returned, and size was not 0, this indicates end of file.
   // If the object is in non-blocking mode and no bytes are available,
   // None is returned.
   //
   // The default implementation defers to readall() and readinto().
   read (size = -1) {
      if (size === -1) return this.readall()
      if (size > this.unreturnedBytes.length) {
         this.readinto(this.unreturnedBytes)
      }
      const result = this.unreturnedBytes.slice(0, size)
      this.unreturnedBytes = this.unreturnedBytes.slice(size)
      return result
   }

   // The second python typographical error -------------v
   /** Read until end of file, using multiple read() call */
   abstract readall (): Bytes

   abstract readinto (b: WritableBuffer<Byte>): number

   // Write the given bytes-like object, b, to the underlying raw stream,
   // and return the number of bytes written. This can be less than the
   // length of b in bytes, depending on specifics of the underlying
   // raw stream, and especially if it is in non-blocking mode.
   // None is returned if the raw stream is set not to block
   // and no single byte could be readily written to it.
   // The caller may release or mutate b after this method returns,
   // so the implementation should only access b during the method call.
   abstract write (b: ReadableBuffer<Byte>): number
}

export abstract class BufferedIOBase<Byte, Bytes extends _Bytes<Byte, Bytes>> extends IOBase<Byte, Bytes> {
   private unreturnedBytes!: Bytes

   // This implementation does happen to have this
   abstract raw: RawIOBase<Byte, Bytes>

   abstract detach (): RawIOBase<Byte, Bytes>

   read (size = -1) {
      const readStart = this.raw.read(size)
      if (!this.isatty()) {
         while (readStart.length < size) {
            this.readinto(readStart)
         }
      }
      this.unreturnedBytes = readStart.slice(size)
      return readStart.slice(0, size)
   }

   read1 (size = -1) {
      if (size === -1) size = Infinity
      if (size > this.unreturnedBytes.length) {
         this.readinto(this.unreturnedBytes)
      }
      const result = this.unreturnedBytes.slice(0, size)
      this.unreturnedBytes = this.unreturnedBytes.slice(size)
      return result
   }

   abstract readinto (b: WritableBuffer<Byte>): number
   abstract readinto1 (b: WritableBuffer<Byte>): number
   abstract write (b: ReadableBuffer<Byte>): number
}

class _GrowableByteArray {
   private buffers: Uint8Array[] = []
   private buffer = 0
   private pointer = 0
   constructor(data: ReadableBuffer<number>, private block_size = data.length * 2) {
      this.add_buffer()
      this.write_bytes(data)
   }

   length () {
      return this.buffers.length * this.block_size
   }

   add_buffer () {
      this.buffers.push(new Uint8Array(this.block_size))
   }

   * iter () {
      for (const buffer of this.buffers) {
         for (const val of buffer) {
            yield val
         }
      }
   }

   make_continuous () {
      const buffer = new Uint8Array(this.iter())
      this.pointer = this.tell()
      this.buffer = 0
      this.buffers = [buffer]
      // perf?
      // this.buffers.splice(0, undefined, buffer)
   }

   as_uint8array () {
      return this.buffers.length === 1
         ? new Uint8Array(this.buffers[0]) // .slice() seems .95 +-.07 https://jsben.ch/RYoqX
         : new Uint8Array(this.iter())
   }

   tell () {
      return this.buffer * this.block_size + this.pointer
   }

   write_bytes (data: ReadableBuffer<number>) {
      for (let i = 0; i < data.length; i++) {
         this.write_byte(this.data[i])
      }
   }

   write_byte (byte: number) {
      this.buffers[this.buffer][this.pointer] = byte
      this.pointer++
      if (this.pointer === this.buffers[this.buffer].length) {
         this.buffer++
      }
      if (this.buffer === this.buffers.length) {
         this.add_buffer()
      }
   }
}

class _TSRawIOBase extends RawIOBase<number, Uint8Array> {
   private unreturnedBytes = new _GrowableByteArray()
   private _inner: Uint8Array
   constructor(initial_bytes: _Bytes<number, Uint8Array>) {
      super()
      this._inner = new _GrowableByteArray(initial_bytes)
   }

   readall (): Uint8Array {
      return this._inner.readall()
   }
   readinto (b: WritableBuffer<number>): number {
      throw new Error("Method not implemented.")
   }
   readline (size = -1): Uint8Array {
      throw new Error("Method not implemented.")
   }
   readlines (hint = -1): Uint8Array[] {
      throw new Error("Method not implemented.")
   }
   seek (offset: number, whence = SEEK_SET): number {
      throw new Error("Method not implemented.")
   }
   truncate (size: number = None): number {
      throw new Error("Method not implemented.")
   }
   write (b: ReadableBuffer<number>): number {
      throw new Error("Method not implemented.")
   }
   __iter__ (): Iterator<Uint8Array, any, undefined> {
      throw new Error("Method not implemented.")
   }
   __next__ (): Uint8Array {
      throw new Error("Method not implemented.")
   }
   __enter__ (): this {
      throw new Error("Method not implemented.")
   }
   close (): void {
      throw new Error("Method not implemented.")
   }
   closed: boolean
   fileno (): number {
      throw new Error("Method not implemented.")
   }
   flush (): void {
      throw new Error("Method not implemented.")
   }
   isatty (): boolean {
      throw new Error("Method not implemented.")
   }
   readable (): boolean {
      throw new Error("Method not implemented.")
   }
   seekable (): boolean {
      throw new Error("Method not implemented.")
   }
   tell (): number {
      throw new Error("Method not implemented.")
   }
   writable (): boolean {
      throw new Error("Method not implemented.")
   }
   writelines (lines: Iterable<ReadableBuffer<number>>): void {
      throw new Error("Method not implemented.")
   }
   __del__ (): void {
      throw new Error("Method not implemented.")
   }
}

export class BytesIO extends BufferedIOBase<number, Uint8Array> {
   raw: RawIOBase<number, Uint8Array>
   constructor(initial_bytes: _Bytes<number, Uint8Array>) {
      super()
      this.raw = new _TSRawIOBase(initial_bytes)
   }

   detach (): RawIOBase<number, Uint8Array> {
      throw UnsupportedOperation("detach")
   }
   readinto (b: WritableBuffer<number>): number {
      throw new Error("Method not implemented.")
   }
   readinto1 (b: WritableBuffer<number>): number {
      return this.readinto(b)
   }
   readline (size = -1): Uint8Array {
      throw new Error("Method not implemented.")
   }
   readlines (hint = -1): Uint8Array[] {
      throw new Error("Method not implemented.")
   }
   seek (offset: number, whence = SEEK_SET): number {
      throw new Error("Method not implemented.")
   }
   truncate (size: number = None): number {
      throw new Error("Method not implemented.")
   }
   write (b: ReadableBuffer<number>): number {
      throw new Error("Method not implemented.")
   }
   __iter__ (): Iterator<Uint8Array, any, undefined> {
      throw new Error("Method not implemented.")
   }
   __next__ (): Uint8Array {
      throw new Error("Method not implemented.")
   }
   __enter__ (): this {
      throw new Error("Method not implemented.")
   }
   close (): void {
      throw new Error("Method not implemented.")
   }
   closed: boolean
   fileno (): number {
      throw new Error("Method not implemented.")
   }
   flush (): void {
      throw new Error("Method not implemented.")
   }
   isatty (): boolean {
      return false
   }
   readable (): boolean {
      throw new Error("Method not implemented.")
   }
   seekable (): boolean {
      throw new Error("Method not implemented.")
   }
   tell (): number {
      throw new Error("Method not implemented.")
   }
   writable (): boolean {
      throw new Error("Method not implemented.")
   }
   writelines (lines: Iterable<ReadableBuffer<number>>): void {
      throw new Error("Method not implemented.")
   }
   __del__ (): void {
      throw new Error("Method not implemented.")
   }

}
