import { assignAll, Dictionary, specialKeys, Specification } from '../src/dictionary'

describe('assignAll', () => {
   test('It works', () => {
      expect(assignAll([2], { a: 5 }).a).toBe(5)
      expect(assignAll([2], { a: 5 })[0]).toBe(2)
      expect(assignAll({ a: 4 }, { a: 5 })?.[0]).toBeUndefined()
      expect(assignAll([1, 2], [3])[1]).toBe(2)
   })

   test('It overrides', () => {
      expect(assignAll({ a: 4 }, { a: 5 }).a).toBe(5)
      expect(assignAll([1, 2], [3])[0]).toBe(3)
   })
})

describe('Dictionary', () => {
   const testDictionary = new Dictionary()

   describe('Property setting, getting, having', () => {
      test('Regular property setting', () => {
         testDictionary.property1 = 7
         expect(testDictionary.property1).toBe(7)
         expect(testDictionary.get('property1')).toBe(7)
         expect(testDictionary.has('property1')).toBe(true)
         expect('property1' in testDictionary).toBe(true)

         testDictionary[0] = specialKeys.ProxyTarget
         expect(testDictionary[0]).toBe(specialKeys.ProxyTarget)
         expect(testDictionary.get(0)).toBeUndefined() // Be careful! Read the documentation!
         expect(testDictionary.get(0, true)).toBe(specialKeys.ProxyTarget)
         expect(testDictionary.get('0')).toBe(specialKeys.ProxyTarget)
         expect(testDictionary.has(0)).toBe(false) // Be careful! Read the documentation!
         expect(testDictionary.has(0, true)).toBe(true)
         expect(testDictionary.has('0')).toBe(true)
         expect(0 in testDictionary).toBe(true)
      })

      test('Method property setting', () => {
         testDictionary.set(testDictionary, 'self')
         // @ts-expect-error Intentional functionality
         expect(testDictionary in testDictionary).toBe(true)
         // @ts-expect-error Intentional functionality
         expect(testDictionary[testDictionary]).toBe('self') // Be careful! Read the documentation!
         expect(testDictionary.get(testDictionary)).toBe('self')
         expect(testDictionary.has(testDictionary)).toBe(true)

         testDictionary.set(Number, 'value 2', false)
         expect(testDictionary.has(Number)).toBe(true)
         expect(testDictionary.get(Number)).toBe('value 2')
         // @ts-expect-error Intentional functionality. This is false because of the way this property was set.
         expect(Number in testDictionary).toBe(false)
         // @ts-expect-error Intentional functionality. This is also false, because there's no match for String(Number) as a key
         expect(testDictionary?.[Number]).toBeUndefined()
      })

      // Todo: Support for regular {Keys Values Entries}
      test('Keys', () => {
         const keys = Array.from(testDictionary.keys())
         expect(keys).toHaveLength(4)
         expect(keys).toContain('property1')
         expect(keys).toContain('0')
         expect(keys).toContain(testDictionary)
         expect(keys).toContain(Number)
      })

      test('Values', () => {
         const values = Array.from(testDictionary.values())
         expect(values).toHaveLength(4)
         expect(values).toContain(7)
         expect(values).toContain(specialKeys.ProxyTarget)
         expect(values).toContain('self')
         expect(values).toContain('value 2')
      })
   })

   // Depends on previous test: Property setting and getting
   test('Property deletion, clear method', () => {
      delete testDictionary.property1
      expect(testDictionary?.property1).toBeUndefined()
      expect(testDictionary.has('property1')).toBe(false)

      testDictionary.clear(true)
      expect(testDictionary?.[0]).toBeUndefined()
      expect(testDictionary.has(0, true)).toBe(false)
      expect(testDictionary.has(testDictionary, true)).toBe(false) // !!!

      testDictionary[0] = 123
      testDictionary.clear(false) // Don't use false unless you're really sure
      expect(testDictionary[0]).toBe(123)
      expect(testDictionary.get(0, false)).toBeUndefined()
   })

   test('Proxy handlers', () => {
      expect(() => {
         Reflect.defineProperty(testDictionary, 'NonExistentProperty', { configurable: false })
      }).toThrow(TypeError)

      expect(Reflect.defineProperty(testDictionary, 'ReflectProperty1', { configurable: true })).toBe(true)
      expect(() => {
         Reflect.defineProperty(testDictionary, 'ReflectProperty1', { configurable: false })
      }).toThrow(TypeError)

      // @ts-expect-error WAIT UNTIL VERSION: 4.3
      Reflect.defineProperty(testDictionary[specialKeys.ProxyTarget], 'ReflectProperty2', { configurable: false })
      // @ts-expect-error WAIT UNTIL VERSION: 4.3
      testDictionary[specialKeys.ProxyTarget].set('ReflectProperty2', 'non-configurable property value')
      expect(testDictionary.ReflectProperty2).toBeUndefined()
      // @ts-expect-error WAIT UNTIL VERSION: 4.3
      expect(testDictionary[specialKeys.ActualPropertyValue].ReflectProperty2).toBe('non-configurable property value')

      Object.freeze(testDictionary)
      expect(() => {
         testDictionary.property = "Not set"
      }).toThrow(TypeError)
   })
})

describe('Specification', () => {
   test('Same value', () => {
      expect(Specification.AbstractOperations.SameValue(-0, 0)).toBe(false)
      expect(Specification.AbstractOperations.SameValue(0n, -0n)).toBe(true) // Apparently JavaScript is inconsistent
      expect(Specification.AbstractOperations.SameValue(undefined, undefined)).toBe(true)
      expect(Specification.AbstractOperations.SameValue(Symbol, Symbol)).toBe(true)
      expect(Specification.AbstractOperations.SameValue(null, null)).toBe(true)
      expect(Specification.AbstractOperations.SameValue(NaN, NaN)).toBe(true)
   })

   test('IsAccessorDescriptor', () => {
      expect(Specification.AbstractOperations.IsAccessorDescriptor({
         get () { return 7 },
         set () {}
      })).toBe(true)
      expect(Specification.AbstractOperations.IsAccessorDescriptor({
         get () { return 7 }
      })).toBe(true)
      expect(Specification.AbstractOperations.IsAccessorDescriptor({
         set () {}
      })).toBe(true)
      expect(Specification.AbstractOperations.IsAccessorDescriptor({})).toBe(false)
      expect(Specification.AbstractOperations.IsAccessorDescriptor({ enumerable: true })).toBe(false)
   })

   test('IsDataDescriptor', () => {
      expect(Specification.AbstractOperations.IsDataDescriptor({
         value: 7,
         writable: true
      })).toBe(true)
      expect(Specification.AbstractOperations.IsDataDescriptor({
         value: false,
         writable: false
      })).toBe(true)
      expect(Specification.AbstractOperations.IsDataDescriptor({
         value: false
      })).toBe(true)
      expect(Specification.AbstractOperations.IsDataDescriptor({
         writable: false
      })).toBe(true)
      expect(Specification.AbstractOperations.IsDataDescriptor({})).toBe(false)
      expect(Specification.AbstractOperations.IsDataDescriptor({ enumerable: true })).toBe(false)
   })

   test('IsGenericDescriptor', () => {
      expect(Specification.AbstractOperations.IsGenericDescriptor({
         get () { return 7 },
         set () {}
      })).toBe(false)
      expect(Specification.AbstractOperations.IsGenericDescriptor({
         get () { return 7 }
      })).toBe(false)
      expect(Specification.AbstractOperations.IsGenericDescriptor({
         set () {}
      })).toBe(false)
      expect(Specification.AbstractOperations.IsGenericDescriptor({
         value: 7,
         writable: true
      })).toBe(false)
      expect(Specification.AbstractOperations.IsGenericDescriptor({
         value: false,
         writable: false
      })).toBe(false)
      expect(Specification.AbstractOperations.IsGenericDescriptor({
         value: false
      })).toBe(false)
      expect(Specification.AbstractOperations.IsGenericDescriptor({
         writable: false
      })).toBe(false)

      expect(Specification.AbstractOperations.IsGenericDescriptor({
         enumerable: true
      })).toBe(true)
      expect(Specification.AbstractOperations.IsGenericDescriptor({
         enumerable: false
      })).toBe(true)
      expect(Specification.AbstractOperations.IsGenericDescriptor({
         configurable: false
      })).toBe(true)
      expect(Specification.AbstractOperations.IsGenericDescriptor({
         configurable: false,
         enumerable: false
      })).toBe(true)
      expect(Specification.AbstractOperations.IsGenericDescriptor({})).toBe(true)
   })

   test('IsCompatiblePropertyDescriptor', () => {
      expect(Specification.AbstractOperations.IsCompatiblePropertyDescriptor(true, {}, undefined)).toBe(true)
      expect(Specification.AbstractOperations.IsCompatiblePropertyDescriptor(false, {}, undefined)).toBe(false)
      expect(Specification.AbstractOperations.IsCompatiblePropertyDescriptor(false, {}, {})).toBe(true)
      expect(Specification.AbstractOperations.IsCompatiblePropertyDescriptor(
         true,
         {
            configurable: true
         },
         {
            configurable: false
         }
      )).toBe(false)
      expect(Specification.AbstractOperations.IsCompatiblePropertyDescriptor(
         true,
         {
            enumerable: false
         },
         {
            configurable: false,
            enumerable: true
         }
      )).toBe(false)
      expect(Specification.AbstractOperations.IsCompatiblePropertyDescriptor(
         true,
         {
            enumerable: true
         },
         {
            configurable: false,
            enumerable: false
         }
      )).toBe(false)
      expect(Specification.AbstractOperations.IsCompatiblePropertyDescriptor(
         false,
         {
            enumerable: true
         },
         {
            configurable: false,
            enumerable: true
         }
      )).toBe(true)
      // Gotta love that && short-circuit. Wow, the specification is ridiculous!
      expect(Specification.AbstractOperations.IsCompatiblePropertyDescriptor(
         false,
         {
            enumerable: true
         },
         {
            configurable: false,
            enumerable: true,
            value: 7
         }
      )).toBe(true)
      expect(Specification.AbstractOperations.IsCompatiblePropertyDescriptor(
         false,
         {
            enumerable: true,
            value: 7
         },
         {
            configurable: false,
            enumerable: true
         }
      )).toBe(false)
      expect(Specification.AbstractOperations.IsCompatiblePropertyDescriptor(
         false,
         {
            enumerable: true,
            value: 7
         },
         {
            configurable: false,
            enumerable: true,
            writable: false,
            value: 7
         }
      )).toBe(true)
      expect(Specification.AbstractOperations.IsCompatiblePropertyDescriptor(
         false,
         {
            enumerable: true,
            value: 'Not equal'
         },
         {
            configurable: false,
            enumerable: true,
            writable: false,
            value: 'Different'
         }
      )).toBe(false)
      expect(Specification.AbstractOperations.IsCompatiblePropertyDescriptor(
         false,
         {
            enumerable: true,
            value: 0
         },
         {
            configurable: false,
            enumerable: true,
            writable: false,
            value: -0
         }
      )).toBe(false)
      expect(Specification.AbstractOperations.IsCompatiblePropertyDescriptor(
         false,
         {
            enumerable: true,
            writable: true,
            value: 0
         },
         {
            configurable: false,
            enumerable: true,
            writable: false,
            value: 0
         }
      )).toBe(false)
      // Some more && short-circuiting
      expect(Specification.AbstractOperations.IsCompatiblePropertyDescriptor(
         false,
         {
            enumerable: true,
            get: Number
         },
         {
            configurable: false,
            enumerable: true,
            get: Number,
            set: Number
         }
      )).toBe(true)
      expect(Specification.AbstractOperations.IsCompatiblePropertyDescriptor(
         false,
         {
            enumerable: true,
            set: Number
         },
         {
            configurable: false,
            enumerable: true,
            get: Number,
            set: Number
         }
      )).toBe(true)
      expect(Specification.AbstractOperations.IsCompatiblePropertyDescriptor(
         false,
         {
            enumerable: true,
            get: Number,
            set: Number
         },
         {
            configurable: false,
            enumerable: true,
            get: Number,
            set: Number
         }
      )).toBe(true)
      expect(Specification.AbstractOperations.IsCompatiblePropertyDescriptor(
         false,
         {
            enumerable: true,
            get: Number,
            set: Object
         },
         {
            configurable: false,
            enumerable: true,
            get: Number,
            set: Number
         }
      )).toBe(false)
      expect(Specification.AbstractOperations.IsCompatiblePropertyDescriptor(
         false,
         {
            enumerable: true,
            get: Number,
            set: Object
         },
         {
            configurable: false,
            enumerable: true,
            get: Object,
            set: Number
         }
      )).toBe(false)
   })
})
