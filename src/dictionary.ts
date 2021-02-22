
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
         return Specification.AbstractOperations.IsAccessorDescriptor(Desc) === false &&
            Specification.AbstractOperations.IsDataDescriptor(Desc) === false
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
         defineProperty (target, property: any, newDescriptor: PropertyDescriptor) {
            const targetIsExtensible = Object.isExtensible(target)
            const currentDescriptor = Object.getOwnPropertyDescriptor(target, property)
            const settingConfigurable = newDescriptor?.configurable ?? false
            if (currentDescriptor === undefined) {
               if (!targetIsExtensible) {
                  throw TypeError('Trying to define a property on a non-extensible object')
               } else if (!settingConfigurable) {
                  throw TypeError('Trying to create a non-configurable property on a property that doesn\'t exist')
               }
            } else {
               if (!Specification.AbstractOperations.IsCompatiblePropertyDescriptor(targetIsExtensible, newDescriptor, currentDescriptor)) {
                  throw TypeError('The property descriptor you gave is incompatible with the property\'s current descriptor')
               }
               if (!settingConfigurable && currentDescriptor.configurable === true) {
                  throw TypeError('You can\'t make non-configurable properties configurable.')
               }
               if (Specification.AbstractOperations.IsDataDescriptor(currentDescriptor) && currentDescriptor.configurable === false && currentDescriptor.writable === true && 'writable' in newDescriptor && newDescriptor.writable === false) {
                  throw TypeError('(Writable non-configureable Proxy properties) can\'t turn into (non-writable properties)')
               }
            }
            Reflect.defineProperty(target, property, newDescriptor)
            if (Specification.AbstractOperations.IsDataDescriptor(newDescriptor)) {
               target.set(property, newDescriptor.value)
            }
            return target
         },
         deleteProperty (target, property) {
            if (Object.getOwnPropertyDescriptor(target, property)?.configurable === false) {
               throw TypeError('Cannot delete a non-configurable property')
            }

            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete target[property]
            target.delete(property)
            return true
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
               if (target.has(property) as boolean) {
                  forceValue(target, [specialKeys.ActualPropertyValue, {}], [property, target.get(property)])
               }
               return undefined
            }

            if (property in target) {
               return target[property]
            }
            if (target.has(property) as boolean) {
               return target.get(property)
            }
         },
         has (target, property) {
            return (property in target) || target.has(property)
         },
         set (target, property, value, _reciever) {
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
            target.set(property, value)
            return true
         }
      })

      // MapInstanceProxy is the same as innerMap, except that when setting a value on MapInstanceProxy,
      // the ProxyHandler set() method is called, which calls the innerMap.set(), which throws an undefined error.

      // To avoid calling innerMap.set(), I use here innerMap instead of MapInstanceProxy.
      innerMap[specialKeys.ProxyTarget] = innerMap
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

   clear (): void {
      for (const key of this.keys()) {
         // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
         delete this[key]
      }
   }

   /**
    * @param {boolean} [isRegularProperty] - When set to true, it only returns true if both the regular property and the Map entry are successfully deleted
    */
   delete (key: any, isRegularProperty: boolean = false): boolean {
      if (isRegularProperty) {
         // @ts-expect-error WAIT UNTIL VERSION: 4.3
         return Map.prototype.delete.call(this[specialKeys.ProxyTarget], key) && delete this[specialKeys.ProxyTarget][key] // eslint-disable-line @typescript-eslint/no-dynamic-delete
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
