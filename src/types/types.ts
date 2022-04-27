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

export type _EnPassantSpec = "legal" | "fen" | "xfen"

/** The side to move or color of a piece */
export type Color = boolean
export type PieceType = 1 | 2 | 3 | 4 | 5 | 6
export type PieceLetter = "p" | "n" | "b" | "r" | "q" | "k"
export type PieceName = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king"
export type Square =
    0n |  1n |  2n |  3n |  4n |  5n |  6n |  7n |
    8n |  9n | 10n | 11n | 12n | 13n | 14n | 15n |
   16n | 17n | 18n | 19n | 20n | 21n | 22n | 23n |
   24n | 25n | 26n | 27n | 28n | 29n | 30n | 31n |
   32n | 33n | 34n | 35n | 36n | 37n | 38n | 39n |
   40n | 41n | 42n | 43n | 44n | 45n | 46n | 47n |
   48n | 49n | 50n | 51n | 52n | 53n | 54n | 55n |
   56n | 57n | 58n | 59n | 60n | 61n | 62n | 63n

export type LineIndex = 0n | 1n | 2n | 3n | 4n | 5n | 6n | 7n
export type KingDistance = 0n | 1n | 2n | 3n | 4n | 5n | 6n | 7n

export type FileName = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h"
export type RankName = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8"
export type SquareName = `${FileName}${RankName}`

// Utils //

// For easy copy-pasting
export const None = null
export type None = null
export type Optional<T> = None | T
