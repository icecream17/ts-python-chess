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
    0 |  1 |  2 |  3 |  4 |  5 |  6 |  7 |
    8 |  9 | 10 | 11 | 12 | 13 | 14 | 15 |
   16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 |
   24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 |
   32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 |
   40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 |
   48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 |
   56 | 57 | 58 | 59 | 60 | 61 | 62 | 63

export type LineIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
export type KingDistance = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

export type FileName = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h"
export type RankName = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8"
export type SquareName = `${FileName}${RankName}`


// For easy copy-pasting
export const None = null
export type None = null
export type Optional<T> = None | T
