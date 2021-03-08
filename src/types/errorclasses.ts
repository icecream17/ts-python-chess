/**
 * Derived from my CustomError implementation at https://github.com/icecream17/tic-tac-toe-grow-for-website/blob/b6d27a5a5bfeac70a7d6d991b12fd344d1f03158/js/game.js#L50:L106
 * 
 * Represents an explicit and somewhat anticipated error
 * The class name is self explanatory.
 *
 * This is derived from MDN and stackoverflow, see
 * 1. The question: https://stackoverflow.com/q/1382107
 * 2. Tero's (edited by RoboCat) answer: https://stackoverflow.com/a/5251506
 * 3. Mohsen's (edited by Kostanos) answer: https://stackoverflow.com/a/32750746
 * 4. The MDN page: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
 *
 * Because of that, the CustomError class is under the CC BY-SA 3.0 License
 * (excluding most of the constructor and the comments which are in the public domain).
 */
export class CustomError extends Error {
   /**
    * The constructor is derived from a code snippet from MDN, which in the public domain
    * The constructor is also mostly in the public domain, except for the else statement which is from
    * Wait though, https://stackoverflow.com/a/42755876 by Matt also has this constructor. And it's more full.
    * I'll just say it's not under the Apache License.
    *
    * @param {string} [message] - The error message shown. Useful and recommended
    */
   constructor (message?: string) {
      super(message);

      // Maintains proper stack trace for where our error was thrown (only available on V8)
      // You must have a really good reason to pass this if statement
      if (String(Error?.captureStackTrace).includes("native code")) {
         Error.captureStackTrace(this, CustomError);
      }
   }

   /**
    * The name of the error's constructor, for example ElementError.
    * This getter is inspired by https://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript#comment84156899_32750746
    * 
    * @returns {string} - The error constructor name, either CustomError or some class extending CustomError
    */
   get name(): string & typeof Object.constructor.name {
      return this.constructor.name
   }
}

export class ValueError extends CustomError {
   requirements: any;
   constructor (message?: string, requirements?: any) {
      super(message)
      this.requirements = requirements
   }
}

