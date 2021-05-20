type TypeKind =
   'undefined' |
   'null' |
   'boolean' |
   'string' |
   'number' |
   'bigint' |
   'symbol' |
   'object' |
   'array' |
   'typed array' |
   'function' |
   'keyed' |
   'structured'

interface without {
   types?: TypeKind[]
   values?: any[]
}

type TypedArray =
   Int8Array |
   Uint8Array |
   Uint8ClampedArray |
   Int16Array |
   Uint16Array |
   Int32Array |
   Uint32Array |
   Float32Array |
   Float64Array |
   BigInt64Array |
   BigUint64Array

interface test {
   undefined?: [undefined]
   null?: [null]
   boolean?: boolean[]
   string?: string[]
   number?: number[]
   bigint?: Array<bigint>
   symbol?: symbol[]
   object?: object[]
   array?: any[][]
   'typed array'?: TypedArray[]
   function?: Function[]
   keyed?: any[]
   structured?: any[]
}

type testFunction =
   'toBe' |
   'toBeInstanceOf' |
   'toBeDefined' |
   'toBeUndefined' |
   'toBeNull' |
   'toBeTruthy' |
   'toBeFalsy' |
   'toBeNaN' |
   'toBeCloseTo' |
   'toBeGreaterThan' |
   'toBeGreaterThanOrEqual' |
   'toBeLessThan' |
   'toBeLessThanOrEqual' |
   'toContain' |
   'toContainEqual' |
   'toEqual' |
   'toStrictEqual' |
   'toHaveBeenCalled' |
   'toHaveBeenCalledTimes' |
   'toHaveBeenCalledWith' |
   'toHaveBeenLastCalledWith' |
   'toHaveBeenNthCalledWith' |
   'toHaveLastReturnedWith' |
   'toHaveNthReturnedWith' |
   'toHaveLength' |
   'toHaveProperty' |
   'toMatch' |
   'toMatchObject' |
   'toMatchSnapshot' |
   'toMatchInlineSnapshot' |
   'toThrow' |
   'toThrowErrorMatchingSnapshot' |
   'toThrowErrorMatchingInlineSnapshot'

export function FunctionTest (
   func: Function,
   expectedValue: unknown,
   without: without = {},
   test: test = {},
   testFunction: testFunction = 'toBe',
   not: boolean = false,
   resolves: boolean = false,
   rejects: boolean = false,
): void {
   if (resolves && rejects) throw RangeError('Function cannot both reject and resolve')
   without.types ??= []
   without.values ??= []

   const toTest = new Map()
   toTest.set('undefined', [undefined])
   toTest.set('null', [null])
   toTest.set('boolean', [true, false])
   toTest.set('string', ['', 'test', 'It worls!', '\n\t\fΣ⬖😁', JSON.stringify([2, 3])])
   toTest.set('number', [NaN, -1, -1.5, Math.random(), Infinity, -Infinity, 0, 7, 123 * 7, 123 ** 7, 10e100])
   toTest.set('bigint', [-34958n, -2n, 0n, 5n, 14n, 46n << 74n])

   // eslint-disable-next-line symbol-description
   toTest.set('symbol', [Symbol(), Symbol('apple'), Symbol(59034)])
   toTest.set('object', [{}, Object.create(null), { toString: 8 }, { a: 7, b: 3, func }, new Date(), Atomics, Intl, JSON])
   toTest.set('array', [without.types, without.values, [0, 1, 2, 3, 4], [{ apple: 1 }, Symbol('Jump'), 2, 'string'], [], Array(72)])
   toTest.set('typed array', [new Uint8ClampedArray(18), new Int16Array(5), new Float32Array(), new BigUint64Array(57)])
   toTest.set('function', [FunctionTest, Function.toString, parseInt, Function, Object])
   toTest.set('keyed', [new Set([1, 2]), new Map(), new WeakMap(), new WeakSet()])
   toTest.set('structured', [new ArrayBuffer(64), new SharedArrayBuffer(1024), new DataView(new ArrayBuffer(32))])

   for (const [type, values] of Object.entries(test)) {
      if (values === undefined) {
         throw ReferenceError('You set something to undefined?')
      }

      if (toTest.has(type)) {
         toTest.get(type).push(...values)
      } else {
         console.warn(`Type to test values for (${type}) doesn't exist!`)
      }
   }

   for (const type of without.types) {
      if (toTest.has(type)) {
         toTest.delete(type)
      } else {
         console.warn(`Type to not test (${type}) doesn't exist!`)
      }
   }

   // @ts-expect-error: See https://github.com/microsoft/TypeScript/issues/42848
   const testValues = Array.from(toTest.values()).filter(testValue => !without.values.includes(testValue))
   for (const test of testValues) {
      let testExpect: any = expect(func(test))

      if (resolves) {
         testExpect = testExpect.resolves
      } else if (rejects) {
         testExpect = testExpect.rejects
      }

      if (not) {
         testExpect = testExpect.not
      }

      testExpect[testFunction](expectedValue)
   }
}
