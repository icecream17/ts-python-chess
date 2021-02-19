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
 *           Creating an Enum
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
