import { Enum, IntFlagEnum } from '../src/enums'

describe('Enum', () => {
   const testEnum = new Enum({
      apple: 'red',
      orange: 'orange',
      blueberry: 'blue'
   })

   test('Enum creation and everything', () => {
      expect(testEnum.apple).toBe('red')
      expect(testEnum.orange).toBe('orange')
      expect(testEnum.blueberry).toBe('blue')

      /* @ts-expect-error */
      expect('blue' instanceof testEnum).toBe(true)
      /* @ts-expect-error */
      expect('apple' instanceof testEnum).toBe(true)
   })
})

describe('IntFlagEnum', () => {
   const testEnum = new IntFlagEnum({
      apple: 1,
      orange: 2,
      blueberry: 4
   })

   test('creation and everything', () => {
      expect(testEnum.apple).toBe(1)
      expect(testEnum.orange).toBe(2)
      expect(testEnum.blueberry).toBe(4)

      /* @ts-expect-error */
      expect(7 instanceof testEnum).toBe(true)
      /* @ts-expect-error */
      expect('apple' instanceof testEnum).toBe(true)
   })

   test('get function', () => {
      expect(() => testEnum.getKey('apple')).toThrow(TypeError)
      expect(testEnum.getKey(4)).toBe('blueberry')

      expect(testEnum.getKey(7)).toBe('apple|orange|blueberry')
      expect(testEnum['apple|orange|blueberry']).toBe(7)

      expect(testEnum.getKey(0)).toBe('0')
   })
})
