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

export type SquareName = 
   "A1" | "B1" | "C1" | "D1" | "E1" | "F1" | "G1" | "H1" |
   "A2" | "B2" | "C2" | "D2" | "E2" | "F2" | "G2" | "H2" |
   "A3" | "B3" | "C3" | "D3" | "E3" | "F3" | "G3" | "H3" |
   "A4" | "B4" | "C4" | "D4" | "E4" | "F4" | "G4" | "H4" |
   "A5" | "B5" | "C5" | "D5" | "E5" | "F5" | "G5" | "H5" |
   "A6" | "B6" | "C6" | "D6" | "E6" | "F6" | "G6" | "H6" |
   "A7" | "B7" | "C7" | "D7" | "E7" | "F7" | "G7" | "H7" |
   "A8" | "B8" | "C8" | "D8" | "E8" | "F8" | "G8" | "H8"


// For easy copy-pasting
export const None = null
