import { ValueError } from "../python/builtin";

/** Raised when move notation is not syntactically valid */
export class InvalidMoveError extends ValueError {}

/** Raised when the attempted move is illegal in the current position */
export class IllegalMoveError extends ValueError {}

/** Raised when the attempted move is ambiguous in the current position */
export class AmbiguousMoveError extends ValueError {}
