
/** An object where every property is allowed */
export interface AnyObject extends Object {
   [key: string]: any
   [key: number]: any
   // @ts-expect-error WAIT UNTIL VERSION: 4.3
   [key: symbol]: any
}
