// This file is
// 1. part of the js-python-chess package.
// 2. derived from the python-chess library
//
// Copyright (C) 2021 Steven Nguyen <icecream17.github@gmail.com>
// Copyright (C) 2012-2021 Niklas Fiekas <niklas.fiekas@backscattering.de>
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

/** The side to move or color of a piece */
export type Color = boolean
export type PieceType = 1 | 2 | 3 | 4 | 5 | 6

/**
 * An object, but every property is allowed
 */
export interface AnyObject extends Object {
   [key: string]: any
   [key: number]: any
   // @ts-expect-error WAIT UNTIL VERSION: 4.3
   [key: symbol]: any
}

/**
 * A function, but every property is allowed
 */
export interface AnyFunction extends AnyObject, Function {
   (...args: any[]): any
}

/**
 * A class, where every property is allowed
 */
export interface AnyClass extends AnyObject, Function {
   new (...args: any[]): any
}

export interface AnyCallableClass extends AnyFunction, AnyClass {}

// For easy copy-pasting
export const None = null
