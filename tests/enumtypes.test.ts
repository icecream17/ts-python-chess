import { CallableClass } from '../src/enumtypes'

describe('CallableClass', () => {
   test('It works', () => {
      // @ts-expect-error Sigh. It can't detect that the proxy actually did something.
      expect((new CallableClass(() => 7, Object))()).toBe(7)
      expect(
         // @ts-expect-error Sigh. It can't detect that the proxy actually did something.
         (new (new CallableClass(
            () => 7,
            class A {
               args: any[]
               constructor (...args: any[]) {
                  this.args = args
               }
            }
         ))(5)).args[0]
      ).toBe(5)
   })
})
