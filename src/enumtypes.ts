/*
 *
 * An enum is a set of members bound to unique, constant values
 * An enum is iterable
 * An enum's members can be compared by identity
 *
 *
 *
 *
 *
 *          Module Contents
 *
 * The python module defines
 * - four enum classes: ```Enum, IntEnum, Flag, IntFlag```,
 * - one decorator, ```unique()```, and
 * - one helper, ```auto```
 *
 *
 * class enum.Enum    - The base class
 * class enum.IntEnum - For constants that are also subclasses of ```int```.
 * class enum.IntFlag - For constants that can be combined using the bitwise operators
 *                      without losing their ```IntFlag``` membership.
 *                      IntFlag members are also subclasses of ```int```.
 * class enum.Flag    - For constants that can be combined using the bitwise operators
 *                      without losing their ```Flag``` membership.
 *
 * enum.unique()      - Enum class decorator that ensures only one name is bound to any value
 *
 * class enum.auto    - Instances are replaced with an appropriate value for Enum members.
 *                      By default, the initial value starts at 1
 *
 *
 *
 *
 *
 *           Creating an Enum - Also see Restricted Enum subclassing
 *
 * Enums are created using the class syntax.
 * An alternative creation method is described in Functional API.
 *
 * To define an enum, subclass Enum as follows:
 * ```
 * from enum import Enum
 * class Color(Enum):
 *    BLACK = 1
 *    NAVY = 2
 *    MIDNIGHTBLUE = 3
 *    BLUE = 4
 * ```
 *
 *    Note: Enum member values
 *          They can be anything
 *
 *    Note: Nomenclature
 *        - The class ```Color``` is the enum
 *        - The attributes ```Color.BLACK, Color.NAVY```, etc., are the enum's members
 *          and are constant
 *        - The enum members have *names* and *values*
 *
 *    Note: Enums are not normal Python classes
 *          See "How are Enums different?" for more details
 *
 *
 *
 *
 *
 *          Enum Members
 *
 * print(Color.BLACK)               # Color.BLACK
 * print(repr(Color.BLACK))         # <Color.BLACK: 1>
 *
 *    Note: Implementation
 *          The first example can be achieved by toString()
 *          The second example can be achieved with __repr__()
 *
 * type(Color.GREEN)                # <enum 'Color'>
 * isinstance(Color.GREEN, Color)   # True
 *
 *    Note: type() == typeof, it's direct
 *          isinstance() == instanceof, it accounts for subclassing
 *
 * print(Color.BLUE.name)           # BLUE
 * print(Color.BLUE.value)          # 4
 *
 *    Note: They're hashable, they can be used in dictionaries and sets
 *
 * apples = {}
 * apples[Color.GREEN] = 'granny smith'
 * apples == {Color.GREEN: 'granny smith'}      # True
 *
 *
 *
 *
 *
 *          Enum Member Access
 *
 * # Computed, programmatic member access
 * Color(1)          # <Color.BLACK: 1>
 * Color(3)          # <Color.MIDNIGHTBLUE: 3>
 *
 * # By name
 * Color['BLUE']     # <Color.BLUE: 4>
 * Color.BLUE        # <Color.BLUE: 4>
 * Color['NAVY']     # <Color.NAVY: 2>
 *
 *
 *
 *
 *
 *          Duplicate members
 *
 * Two members cannot have the same name.
 *
 * class Shape(Enum):
 *    SQUARE = 2
 *    SQUARE = 3
 *
 * > TypeError: Attempted to reuse key: 'SQUARE'
 *
 * But they can have the same value.
 * In that case, the duplicate(s) are aliases.
 * (First and Duplicates) will both get First
 *
 * For example,
 *    SQUARE = 2
 *    ALIAS_FOR_SQUARE = 2       # <Shape.Square: 2>
 *
 *
 *
 *
 *          Ensuring unique values
 *
 * @enum.unique: A class decorator that searches an enum's __members__
 *               and raises ValueError on any value aliases.
 *
 * Just put @unique before the class declaration:
 *
 * @unique
 * class Oops(Enum):
 *    THREE = 3
 *    FOUR = 3
 *
 * > ValueError: Duplicate values found in <enum 'Oops'>: FOUR -> THREE
 *
 *
 *
 *
 *
 *          Using automatic values
 *
 * If the values are unimportant you can use ```auto```
 *
 *    BLACK = auto()
 *    NAVY = auto()
 *    MIDNIGHTBLUE = auto()
 *
 *
 *
 *          (Enum class)._generate_next_value()
 *
 * The values are chosen by ```_generate_next_value_()``` which can be overridden
 *
 * class AutoName(Enum):
 *    def _generate_next_value_(name, start, count, last_values):
 *       return name
 *
 * class Ordinal(AutoName):
 *    NORTH = auto()
 *    ...
 *
 *
 *    Note: The goal of the default ```_generate_next_value_()``` method
 *          is to provide the next ```int``` in a sequence, given the last ```int```.
 *          Implementation dependent.
 *
 *    Note: ```_generate_next_value_()``` must be defined before any other members
 *
 *
 *
 *
 *
 *          Iteration
 * Any aliases are not provided during iteration
 *
 *
 *
 *          (Enum class).__members__
 * Readonly, it's maps names to members, including aliases.
 *
 *
 *
 *
 *
 *          Comparisons
 *
 * Enum members are compared by identity
 * Color.BLUE is Color.BLUE         # True
 * Color.NAVY is not Color.BLUE     # True
 *
 * Ordered comparisons are not supported, with the exception of IntEnum
 * Color.NAVY < Color.BLUE          # TypeError: '<' not supported between instances of 'Color' and 'Color'
 *
 * Equality comparisons are defined though
 * Color.BLUE == Color.BLUE         # True
 * Color.NAVY != Color.BLUE         # True
 *
 * Comparing against non-enum values will always compare not-equal, with the exception of IntEnum
 * Color.BLUE == 46n                # False
 *
 *
 *
 *
 *
 *          Allowed enum members and attributes
 *
 * Names that start and end with a single underscore are reserved by enum and cannot be used
 * All other attributes defined in an enum are members of that enum except for:
 *    special methods, like __str__()
 *    descriptors (methods are also descriptors)
 *    variables names listed in _ignore_
 *
 *
 *
 *
 *
 *          Restricted Enum subclassing
 *
 * Enum creation syntax:
 *    As many mix-ins as you want, up to 1 data-type, and one base-enum class.
 *
 * class EnumName ([...mix-in] [date-type] base-enum)
 *
 *
No  Subclassing an enum is only allowed if the new enum does not define any members.
No  class MoreColor(Color):
No     PINK = 17
No
No  > TypeError: Cannot extend enums
 *
 *
 *
 *
 *
No       Pickling
 *
 *
 *
 *
 *
 *       Functional API
 *
 * The ```Enum``` class is callable
 *
 * EnumVariable = Enum(value='NewEnumName', names=<...>, *, type=<mixed-in class>, start=1)
 *
 * MemberNameSource:
 *    Whitespace-seperated string of names,
 *    a sequences of names,
 *    a sequence of 2-tuples with key/value pairs,
 *    a mapping of names to values
 *
 * The last two options enable assigning arbitrary keys to values,
 * while the others auto-assign increasing integers starting with 1.
 * (Use the ```start``` parameter to specify a different starting value)
 *
 * So the following two definitions are equivalent:
 *
 * Animal = Enum('Animal', 'ANT BEE CAT DOG')
 *
 * class Animal(Enum):
 *    ANT = 1
 *    BEE = 2
 *    CAT = 3
 *    DOG = 4
 *
 *
 *
 *
 *
 *             Derived Enums
 *
 *          1. Int Enum
 *
 * Subclass of ```int```
 * Int Enum members can be compared with numbers,
 * and also other Int Enum members
 *
 *          2. Int Flag
 *
 * Subclass of ```int```
 * Int Flag members can combined using the bitwise operators,
 * and the result would still be an Int Flag member.
 *
 * It's possible to name the combinations
 *
 * class Color(IntFlag):
 *    WHITE: 0       # Combo of <None>
 *    RED: 1
 *    BLUE: 2
 *    PURPLE: 3      # Combo of RED and BLUE
 *    YELLOW: 4
 *    ORANGE: 5      # Combo of RED and YELLOW
 *    GREEN: 6       # Combo of BLUE and YELLOW
 *    BLACK: 7       # Combo of RED, BLUE, and YELLOW
 *
 * If an IntFlag member has a value of 0, the boolean of that value is false:
 * bool(Color.WHITE) # False
 *
 * IntFlag can also be combined with ```int```:
 * Color.BLUE | 8    # <Color.8|BLUE: 2>
 *
 *          3. Flag
 *
 * The last variation.
 * Like ```IntFlag```, ```Flag``` members can be combined with bitwise operators.
 * Unlike IntFlag, they cannot be combined with, nor compared against, any other Flag enum member, nor int
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 **/

import { AnyCallableClass, AnyClass } from './types'

/**
 * Makes a class callable.
 */
export function CallableClass (func: Function, cls: AnyClass): AnyCallableClass {
   // The function's target must be both a function and a constructor
   // thisArg can obviously be anything,
   // argumentsList is obviously an array:
   // https://tc39.es/ecma262/#sec-proxy-object-internal-methods-and-internal-slots-call-thisargument-argumentslist
   // and of course, calling a function can return anything,
   const classProxy = new Proxy(cls, {
      apply (_target: typeof cls, thisArg: any, argArray: any[]) {
         return func.apply(thisArg, argArray)
      }
   })
   Object.setPrototypeOf(classProxy, CallableClass.prototype)
   return classProxy as AnyCallableClass
}
