import { ValueError } from "../python/builtin"
import { make_callable } from "../utils/objects"

/** Raised when move notation is not syntactically valid */
export const InvalidMoveError = make_callable(class InvalidMoveError extends ValueError {})

/** Raised when the attempted move is illegal in the current position */
export const IllegalMoveError = make_callable(class IllegalMoveError extends ValueError {})

/** Raised when the attempted move is ambiguous in the current position */
export const AmbiguousMoveError = make_callable(class AmbiguousMoveError extends ValueError {})
