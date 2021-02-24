
import { AnyObject } from './types'

// Todo: Readonly
export const specialKeys = {
   UnionObject: Symbol('Union object'),
   UnionClass: Symbol('Union class'),
   ClassList: Symbol('Class list'),
   ActualPropertyValue: Symbol('To avoid typeerror'),
   AnotherPropertyValue: Symbol('Two or more classes have the same property'),
   ProxyTarget: Symbol('So that I can access the target of a proxy')
}

/**
 * Assigns ALL non-inherited properties from sources into a target object.
 * Source properties override target properties
 */
export function assignAll (...sources: any[]): any {
   const target: AnyObject = {}
   for (const source of sources) {
      for (const propertyKey of [...Object.getOwnPropertyNames(source), ...Object.getOwnPropertySymbols(source)]) {
         // @ts-expect-error WAIT UNTIL VERSION: 4.3
         target[propertyKey] = source[propertyKey]
      }
   }
   return target
}

/**
 * A good *enough* shallow copy
 */
export function shallowCopy (value: any): any {
   if (['undefined', 'boolean', 'number', 'bigint', 'symbol', 'string'].includes(typeof value) || value === null) {
      return value
   } else {
      return assignAll(Object.create(Object.getPrototypeOf(value)), value)
   }
}

/**
 * Adds the property if it doesn't exist,
 * then sets property to value
 *
 * @example
 *    forceValue(people, "john smith", "infromation", "name", "smith, john", "regular name", "John Smith")
 * @example
 *    forceValue(board, "square", [0, []], [0, "A1"])
 */
export function forceValue (obj: any, ...AtLeastOneKeyAndValue: Array<PropertyKey | [PropertyKey, any]>): typeof obj {
   for (const KeyOrKeyAndValue of AtLeastOneKeyAndValue) {
      if (Array.isArray(KeyOrKeyAndValue) && KeyOrKeyAndValue.length === 2) {
         obj = obj[KeyOrKeyAndValue[0]] ??= KeyOrKeyAndValue[1]
      } else {
         obj = obj[KeyOrKeyAndValue]
      }
   }
   return obj
}

export const Specification = {
   AbstractOperations: {
      SameValue: Object.is,
      IsAccessorDescriptor (Desc: PropertyDescriptor) {
         return 'get' in Desc || 'set' in Desc
      },
      IsDataDescriptor (Desc: PropertyDescriptor) {
         return 'value' in Desc || 'writable' in Desc
      },
      IsGenericDescriptor (Desc: PropertyDescriptor) {
         return !Specification.AbstractOperations.IsAccessorDescriptor(Desc) &&
            !Specification.AbstractOperations.IsDataDescriptor(Desc)
      },
      IsCompatiblePropertyDescriptor (extensible: boolean, Desc: PropertyDescriptor, current?: PropertyDescriptor): boolean {
         if (current === undefined) {
            return extensible
         }

         // If every field in Desc is absent, return true
         if (!('value' in Desc || 'writable' in Desc || 'get' in Desc || 'set' in Desc || 'enumerable' in Desc || 'configurable' in Desc)) {
            return true
         }

         // I think that it's impossible for either enumerable property to be -0 or 0
         if (current.configurable === false && (
            (Desc?.configurable === true) ||
            ('enumerable' in Desc && Desc.enumerable !== current.enumerable)
         )) {
            return false
         }

         // IsGenericDescriptor
         if (!('value' in Desc || 'writable' in Desc || 'get' in Desc || 'set' in Desc)) {
            // then don't do anything
            // Specification note: No further validation is required
         } else if ((Specification.AbstractOperations.IsDataDescriptor(current) !== Specification.AbstractOperations.IsDataDescriptor(Desc)) && current.configurable === false) {
            return false
         } else if (Specification.AbstractOperations.IsDataDescriptor(current) && Specification.AbstractOperations.IsDataDescriptor(Desc) && current.configurable === false && current.writable === false) {
            return !(
               ('writable' in Desc && Desc.writable === true) ||
               ('value' in Desc && !Specification.AbstractOperations.SameValue(Desc.value, current.value))
            )
         } else if (current.configurable === false) {
            return !(
               ('set' in Desc && !Specification.AbstractOperations.SameValue(Desc.set, current.set)) ||
               ('get' in Desc && !Specification.AbstractOperations.SameValue(Desc.get, current.get))
            )
         }

         return true
      }
   }
}

const MapProxyHandler = {
   construct (target: MapConstructor, argArray: any[], newTarget: Function) {
      const innerMap = Reflect.construct(target, argArray, newTarget)
      const MapInstanceProxy = new Proxy(innerMap, {
         defineProperty (target, property: any, newDescriptor: PropertyDescriptor): boolean {
            const targetIsExtensible = Object.isExtensible(target)
            const currentDescriptor = Object.getOwnPropertyDescriptor(target, property)
            const settingConfigurable = newDescriptor?.configurable
            if (currentDescriptor === undefined) {
               if (!targetIsExtensible) {
                  throw TypeError('Trying to define a property on a non-extensible object')
               } else if (settingConfigurable === false) {
                  throw TypeError('Trying to create a non-configurable property on a property that doesn\'t exist')
               }
            } else {
               if (!Specification.AbstractOperations.IsCompatiblePropertyDescriptor(targetIsExtensible, newDescriptor, currentDescriptor)) {
                  throw TypeError('The property descriptor you gave is incompatible with the property\'s current descriptor')
               }
               if (settingConfigurable === false && currentDescriptor.configurable === true) {
                  throw TypeError('You can\'t make non-configurable properties configurable.')
               }
               if (Specification.AbstractOperations.IsDataDescriptor(currentDescriptor) && currentDescriptor.configurable === false && currentDescriptor.writable === true && 'writable' in newDescriptor && newDescriptor.writable === false) {
                  throw TypeError('(Writable non-configureable Proxy properties) can\'t turn into (non-writable properties)')
               }
            }

            if (Specification.AbstractOperations.IsDataDescriptor(newDescriptor)) {
               return Reflect.defineProperty(target, property, newDescriptor) && target.set(property, newDescriptor.value)
            }
            return Reflect.defineProperty(target, property, newDescriptor)
         },
         deleteProperty (target, property): boolean {
            if (Object.getOwnPropertyDescriptor(target, property)?.configurable === false) {
               throw TypeError('Cannot delete a non-configurable property')
            }

            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            return target.delete(property, true)
         },
         get (target, property, _receiver): any {
            const descriptor = Object.getOwnPropertyDescriptor(target, property)
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/get
            // if a non-configurable own accessor property that has undefined as its [[Get]] attribute,
            //    return undefined

            // highest precedence: &&
            if (
               descriptor !== undefined &&
               descriptor.configurable === false &&
               Specification.AbstractOperations.IsAccessorDescriptor(descriptor) &&
               descriptor.get === undefined
            ) {
               if (target.has(property, true) as boolean) {
                  forceValue(target, [specialKeys.ActualPropertyValue, {}], [property, target.get(property)])
               }
               return undefined
            }

            if (property in target) {
               return target[property]
            }
            if (target.has(property, true) as boolean) {
               return target.get(property)
            }
         },
         has (target, property) {
            return target.has(property, true)
         },
         set (target, property, value, _reciever): boolean {
            const descriptor = Object.getOwnPropertyDescriptor(target, property)
            if (descriptor?.configurable === false) {
               if (descriptor?.writable === false) {
                  console.warn('Attempted to set value of non-writable property')
                  return false
               } else if (Specification.AbstractOperations.IsAccessorDescriptor(descriptor) && descriptor.set === undefined) {
                  console.warn('Cannot set property of a non-configurable accessor property whose descriptor.set === undefined, see Proxy handler.set() from MDN')
                  return false
               }
            }
            target[property] = value
            Map.prototype.set.call(target, property, value)
            return target[property] === value && Map.prototype.has.call(target, property)
         }
      })

      // MapInstanceProxy is the same as innerMap, except that when setting a value on MapInstanceProxy,
      // the ProxyHandler set() method is called, which calls the innerMap.set(), which throws an undefined error.

      // To avoid calling innerMap.set(), I use here innerMap instead of MapInstanceProxy.
      Object.defineProperty(innerMap, specialKeys.ProxyTarget, {
         configurable: false,
         enumerable: false,
         writable: false,
         value: innerMap
      })
      return MapInstanceProxy
   }
}

const MapProxy: MapConstructor = new Proxy(Map, MapProxyHandler)

/**
 How It Works:
 class Dictionary extends MapProxy

 When you set a property on MapProxy it automatically calls
 Map.set() for you.

 It does other things automatically too when you
 - ```delete``` a property
 - check if a property is ```in``` the dictionary

 It's a Map, but better.

 @example
 ```javascript
 let dictionary = new Dictionary()
 dictionary.property = dictionary?.property ?? 1
 dictionary.property2 = 2
 dictionary.property3 = new Dictionary()
 dictionary.property3.property4 = ['A random array']
 ```

 @classdesc
 You can still use the old Map methods though.

 @example
 ```javascript
 let dictionary = new Dictionary()

 // But I don't know why you would want to...
 if (!dictionary.has('property')) {
    dictionary.set('property', 1)
 }

 // ...well actually they are pretty useful
 dictionary.entries() // [['property', 1]]
 ```

 @classdesc
 WARNING

 Remember that regular object keys can only be strings or symbols.
 So if you're using Objects as keys in a dictionary, then tough luck for you.

 ```
 let dictionary = new Dictionary()
 dictionary[0] = 'Test'

 // If you didn't know, the property that is defined isn't the number 0, but rather the string '0'
 // Bug potential!!!
 dictionary.get(0) // undefined

 // To avoid this, you can convert to string:
 dictionary.get(String(0)) // 'Test'

 // Or use the "isRegularProperty" argument
 dictionary.get(0, true) // 'Test'
 ```

 @example
 ```
 // Here are the call stacks for each operator
 // (Remember, non-string/symbol properties are automatically converted to strings,
 // like with dictionary[0] or with dictionary[Number])

 dictionary.property
 /-> ProxyHandler.get
 |---> if property in dictionaryInner
 |---> return dictionaryInner.property
 ----> if dictionaryInner.has(property)
 ----> return dictionaryInner.get(property)

 property in dictionary
 /-> ProxyHandler.has
 --> innerDictionary.has(property, true)

 dictionary.has(property, true?)
 |-> return Map#has.call(dictionaryInner, property) ||
 |->        true? && property in dictionaryInner

 dictionary.property = value
 /-> ProxyHandler.set
 |---> innerDictionary.property = value
 |---> Map#set.call(innerDictionary, property, value)
 |---> return Map#has.call(innerDictionary, property) &&
 |--->        innerDictionary.property === value

 dictionary.get(property, true?)
 |-> if true?
 |--> if property in innerDictionary
 |---> return innerDictionary[property]
 |-> if Map#has.call(innerDictionary, property)
 |---> return Map#get.call(innerDictionary, property)

 delete dictionary.property
 /-> ProxyHandler.deleteProperty
 --> innerDictionary.delete(property, true)

 dictionary.delete(property, true?)
 |-> if true? then
 |---> return delete innerDictionary[property] &&
 |--->        Map#delete.call(innerDictionary)
 |-> else
 |---> return Map#delete.call(innerDictionary)

 dictionary.set(property, true?)
 |-> if true? then innerDictionary.property = value
 |-> Map#set.call(innerDictionary, property, value)

 ```
 */

export class Dictionary extends MapProxy {
   // Index signatures for Dictionary
   [key: string]: any
   [key: number]: any
   // @ts-expect-error WAIT UNTIL VERSION: 4.3
   [key: symbol]: any

   // @ts-expect-error WAIT UNTIL VERSION: 4.3
   [key: specialKeys.ProxyTarget]: any

   [Symbol.iterator] (): IterableIterator<[any, any]> {
      // @ts-expect-error WAIT UNTIL VERSION: 4.3
      return Map.prototype[Symbol.iterator].call(this[specialKeys.ProxyTarget])
   }

   // TODO: isRegularProperty in the methods: clear, entries, forEach, keys, values

   /**
    * IMPORTANT: Unlike the other functions, by default isRegularProperty is true
    * IMPORTANT: If you set this to false, then ONLY the Map.delete is called
    * That means that any properties will stay!
    *
    * @example
    * ```
    * dict.apples = 2
    * dict.clear()
    * dict.has(apples) // false
    *
    * dict.oranges = 3
    * // When regularProperties = false
    * // Map (oranges => 3), oranges: 3
    * // turns into
    * // Map (empty), oranges: 3
    *
    * // So you probably don't want to do that!
    * ```
    */
   clear (regularProperties: boolean = true): void {
      for (const key of this.keys()) {
         this.delete(key, regularProperties)
      }
   }

   /**
    * @param {boolean} [isRegularProperty] - When set to true, it only returns true if both the regular property and the Map entry are successfully deleted
    */
   delete (key: any, isRegularProperty: boolean = false): boolean {
      if (isRegularProperty) {
         // If a property can't be deleted there might be an error
         try {
            // @ts-expect-error WAIT UNTIL VERSION: 4.3
            const success = delete this[specialKeys.ProxyTarget][key] // eslint-disable-line @typescript-eslint/no-dynamic-delete
            // @ts-expect-error WAIT UNTIL VERSION: 4.3
            return Map.prototype.delete.call(this[specialKeys.ProxyTarget], key) && success
         } catch (_error) {
            // @ts-expect-error WAIT UNTIL VERSION: 4.3
            Map.prototype.delete.call(this[specialKeys.ProxyTarget], key)
            return false
         }
      }
      // @ts-expect-error WAIT UNTIL VERSION: 4.3
      return Map.prototype.delete.call(this[specialKeys.ProxyTarget], key)
   }

   entries (): IterableIterator<[any, any]> {
      // @ts-expect-error WAIT UNTIL VERSION: 4.3
      return Map.prototype.entries.call(this[specialKeys.ProxyTarget])
   }

   forEach (): void {
      // @ts-expect-error WAIT UNTIL VERSION: 4.3
      return Map.prototype.forEach.call(this[specialKeys.ProxyTarget])
   }

   /**
    * Gets a property value
    * @param {any} key - The property key
    * @param {boolean} [isRegularProperty] - If the regular property exists return that instead
    */
   get (key: any, isRegularProperty: boolean = false): any | undefined {
      // @ts-expect-error WAIT UNTIL VERSION: 4.3
      if (isRegularProperty && key in this[specialKeys.ProxyTarget]) {
         // @ts-expect-error WAIT UNTIL VERSION: 4.3
         return this[specialKeys.ProxyTarget][key]
      // @ts-expect-error WAIT UNTIL VERSION: 4.3
      } else if (Map.prototype.has.call(this[specialKeys.ProxyTarget], key)) {
         // @ts-expect-error WAIT UNTIL VERSION: 4.3
         return Map.prototype.get.call(this[specialKeys.ProxyTarget], key)
      }
   }

   has (key: any, isRegularProperty: boolean = false): boolean {
      return (
         // @ts-expect-error WAIT UNTIL VERSION: 4.3
         Map.prototype.has.call(this[specialKeys.ProxyTarget], key) ||
         // @ts-expect-error WAIT UNTIL VERSION: 4.3
         (key in this[specialKeys.ProxyTarget] && isRegularProperty)
      )
   }

   keys (): IterableIterator<any> {
      // @ts-expect-error WAIT UNTIL VERSION: 4.3
      return Map.prototype.keys.call(this[specialKeys.ProxyTarget])
   }

   /**
    * Just like the normal Map.prototype.set,
    * except that it also sets the property too.
    *
    * Psuedocode of function:
    * ```
    * set (key: any, value: any): this {
    *    this[key] = value
    *    Map.prototype.set.call(this[key], value)
    *    return this
    * }
    * ```
    *
    * If you didn't know, Map.prototype.set returns ```this```.
    *
    * IMPORTANT: Unlike the other functions, by default isRegularProperty is true
    */
   set (key: any, value: any, isRegularProperty: boolean = true): this {
      if (isRegularProperty) {
         // @ts-expect-error WAIT UNTIL VERSION: 4.3
         this[specialKeys.ProxyTarget][key] = value
      }
      // @ts-expect-error WAIT UNTIL VERSION: 4.3
      Map.prototype.set.call(this[specialKeys.ProxyTarget], key, value)
      return this
   }

   values (): IterableIterator<any> {
      // @ts-expect-error WAIT UNTIL VERSION: 4.3
      return Map.prototype.values.call(this[specialKeys.ProxyTarget])
   }
}
