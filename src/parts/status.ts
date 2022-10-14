// Status is not used with other values
// So there's no difference between numbers and bigints, hopefully

export const enum Status {
   VALID = 0,
   NO_WHITE_KING = 1 << 0,
   NO_BLACK_KING = 1 << 1,
   TOO_MANY_KINGS = 1 << 2,
   TOO_MANY_WHITE_PAWNS = 1 << 3,
   TOO_MANY_BLACK_PAWNS = 1 << 4,
   PAWNS_ON_BACKRANK = 1 << 5,
   TOO_MANY_WHITE_PIECES = 1 << 6,
   TOO_MANY_BLACK_PIECES = 1 << 7,
   BAD_CASTLING_RIGHTS = 1 << 8,
   INVALID_EP_SQUARE = 1 << 9,
   OPPOSITE_CHECK = 1 << 10,
   EMPTY = 1 << 11,
   RACE_CHECK = 1 << 12,
   RACE_OVER = 1 << 13,
   RACE_MATERIAL = 1 << 14,
   TOO_MANY_CHECKERS = 1 << 15,
   IMPOSSIBLE_CHECK = 1 << 16,
}

export const STATUS_VALID = Status.VALID
export const STATUS_NO_WHITE_KING = Status.NO_WHITE_KING
export const STATUS_NO_BLACK_KING = Status.NO_BLACK_KING
export const STATUS_TOO_MANY_KINGS = Status.TOO_MANY_KINGS
export const STATUS_TOO_MANY_WHITE_PAWNS = Status.TOO_MANY_WHITE_PAWNS
export const STATUS_TOO_MANY_BLACK_PAWNS = Status.TOO_MANY_BLACK_PAWNS
export const STATUS_PAWNS_ON_BACKRANK = Status.PAWNS_ON_BACKRANK
export const STATUS_TOO_MANY_WHITE_PIECES = Status.TOO_MANY_WHITE_PIECES
export const STATUS_TOO_MANY_BLACK_PIECES = Status.TOO_MANY_BLACK_PIECES
export const STATUS_BAD_CASTLING_RIGHTS = Status.BAD_CASTLING_RIGHTS
export const STATUS_INVALID_EP_SQUARE = Status.INVALID_EP_SQUARE
export const STATUS_OPPOSITE_CHECK = Status.OPPOSITE_CHECK
export const STATUS_EMPTY = Status.EMPTY
export const STATUS_RACE_CHECK = Status.RACE_CHECK
export const STATUS_RACE_OVER = Status.RACE_OVER
export const STATUS_RACE_MATERIAL = Status.RACE_MATERIAL
export const STATUS_TOO_MANY_CHECKERS = Status.TOO_MANY_CHECKERS
export const STATUS_IMPOSSIBLE_CHECK = Status.IMPOSSIBLE_CHECK
