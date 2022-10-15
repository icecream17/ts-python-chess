
# ts-python-chess

***This is Not finished at all***

I decided to make my own version of chess.js

But I got lazy. So instead this is just a typescript port of [python-chess](https://github.com/niklasf/python-chess)

The resulting javascript files (expect success.js) should be implementation independent.
So it'll work in browser too. As long as your browser is recent enough.

## Usage

```npm install --save-dev js-python-chess```

### Types

Python has the class `type` from which other things like `bool` and `int` subclass.

This is not how it works in JavaScript. Currently my rewrite erased my solution to this problem,
which would be a bunch of functions in one file, like `is_color`, `is_piece_type`, etc.

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

Additionally, `chess.Status` is an `IntFlag Enum`, which subclasses both `Int` and `Enum`.

In JavaScript, there can only be one prototype per object, so I'd have to do something really crazy
to implement something like this. Instead I just used TypeScript's regular `Enum`.

There are again and again subtle differences between Python and JavaScript that I'm just going to
ignore.

### License

Should be the same as the latest version of python-chess
