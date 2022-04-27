// This file is
// 1. part of the ts-python-chess package.
// 2. derived from the python-chess library
//
// Copyright (C) 2022 Steven Nguyen <icecream17.github@gmail.com>
// Copyright (C) 2012-2022 Niklas Fiekas <niklas.fiekas@backscattering.de>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

/*  Never gonna give you up, never gonna let you down,    */
/*  never gonna turn around, and, desert you.             */

/**
 * @fileoverview
 * Corresponds to the __init__ file from the python chess library
 *
 * https://github.com/niklasf/python-chess/blob/master/chess/__init__.py
 *
 * A chess library with move generation and validation,
 * Polyglot opening book probing, PGN reading and writing,
 * Gaviota tablebase probing,
 * Syzygy tablebase probing, and XBoard/UCI engine communication.
 */

/** Typescript hacks */
declare global {
   interface ReadonlyArray<T> {
      map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): { [K in keyof this]: U }
      includes<V>(searchElement: V, fromIndex?: number): V extends T ? boolean : false
      indexOf<V>(searchElement: V, fromIndex?: number): V extends T ? number : -1
   }
}

export * from "./parts/colors"
export * from "./parts/pieces"
export * from "./parts/status"
export * from "./parts/outcome"
export * from "./parts/board"
export * from "./parts/bboard"
