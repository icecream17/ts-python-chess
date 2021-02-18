
# ts-python-chess

***This is Not finished at all***

I decided to make my own version of chess.js

But I got lazy. So instead this is just a typescript version of [python-chess](https://github.com/niklasf/python-chess)

(Now it's just called [chess](https://pypi.org/project/chess/))

Which totally defeats the purpose, but oh well.

TRhe resulting javascript files (expect success.js) should be implementation independent.  
So it'll work in browser too. As long as your browser is recent enough.

## Usage

```npm install --save-dev js-python-chess```

### Types

TypeScript doesn't support types the way Python does.  
For example, in Python:

```python
import chess

print(chess.Color) # <class 'bool'>
print(chess.PieceType) # <class 'int'>

# type(x) for the exact type
print(type(false) is chess.Color) # True
print(type(2) is chess.PieceType) # True

# isinstance(x, type) which also supports derived types
print(isinstance(false, chess.Color)) # True
print(isinstance(2, chess.PieceType)) # True
```

But even thought it's TypeScript instead of JavaScript, type checking is still kinda a mess...

```typescript
class SomeClass {}

typeof 2                           // "number"
typeof Object(2)                   // "object"
typeof new SomeClass               // "object"
2 instanceof Number                // false
Object(2) instanceof Number        // true
new SomeClass instanceof SomeClass // true
```

This isn't very useful.  
I agree with ```typeof``` for primitives, and ```instanceof``` for objects.

The ```chess.Color``` won't be very useful - it'll just copy the python-chess value.

```python
Color = bool
```

```typescript
const Chess = {
   Color: Boolean
}
```

So I added some new "isType" functions.

```typescript
Chess.isColor(true)  // true
Chess.isPieceType(5) // true

// NOTE: I can't use BigInt to represent 'int' in python, because of things like Array[0n]
Chess.isSquare(10n)  // false
Chess.isSquare(10)   // true
Chess.isSquare(3858) // "out of range"
                     // Becuase python-chess outputs "True".
                     // I have to output a truthy value too.
                     // But hopefully this is more helpful.
Chess.isSquare(10.5) // false - not an integer
Chess.isSquare(2.5)  // false
Chess.isSquare(4)    // true
```

Some other notes about types:

* ```None``` corresponds to ```null```

### Developer notes

I'm just using the same license as python-chess

This used to have something here about how it didn't work without a worka-round, but that's fixed.
