// TODO

import { FunctionTest } from './function-test'

function Oops (value: any): boolean {
   return typeof value === 'object'
}

describe('FunctionTest', () => {
   test('It doesn\'t fail', () => {
      expect(() => {
         FunctionTest(Oops, true, { types: ['number', 'string', 'symbol', 'bigint', 'undefined', 'function'] })
      }).not.toThrow()
   })

   test('It fails when both rejects and resolves are set to true', () => {
      expect(() => {
         FunctionTest(Oops, true, { types: ['number', 'string', 'symbol', 'bigint', 'undefined', 'function'] }, undefined, undefined, undefined, true, true)
      }).toThrow(RangeError)
   })

   test('It fails when something to test is explicitly set to undefined', () => {
      expect(() => {
         FunctionTest(Oops, true, { types: ['number', 'string', 'symbol', 'bigint', 'undefined', 'function'] }, { undefined: undefined })
      }).toThrow(ReferenceError)
   })

   test('The ```not``` argument', () => {
      expect(() => {
         FunctionTest(() => true, false, undefined, undefined, undefined, true)
      }).not.toThrow()
   })

   test('async resolve', () => {
      expect(() => {
         FunctionTest(async () => true, true, undefined, { number: [4] }, undefined, undefined, true)
      }).not.toThrow()
   })
})
