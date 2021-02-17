
# ts-python-chess

*****This is Not finished at all*****

I decided to make my own version of chess.js

But I got lazy. So instead this is just a typescript version of [python-chess](https://github.com/niklasf/python-chess)

Which totally defeats the purpose, but oh well.

TRhe resulting javascript files (expect success.js) should be implementation independent.  
So it'll work in browser too. As long as your browser is recent enough.

## Usage

```npm install --save-dev js-python-chess```

You would only need the ```src``` folder... but there's the license too,  
so maybe just use the whole thing.

```src/chess.js``` is the main source file  
```src/chessboard.js``` is the chessboard  
...and the rest of the files are also just as self explanatory

### Developer notes

If you want to actually edit and change it, feel free.  
The Apache License is just a more detailed version of the MIT License.

(Not legal advice)

But note that if you want to run the tests, you have to copy and paste the  
```babel.config.json``` file to the folder containing the root folder,  
because of the way babel works. By which I mean, doesn't work.
