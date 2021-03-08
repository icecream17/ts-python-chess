import { ColorClass } from "../types/typeclasses";
import { Color } from "../types/types";

export const ColorPart = {
   Color: ColorClass,
   isColor: ColorClass[Symbol.hasInstance],

   // Interestingly enums of booleans are not allowed
   WHITE: true as Color & true,
   BLACK: false as Color & false,
   COLORS: ColorClass.Colors,
   COLOR_NAMES: ['black', 'white'] as ['black', 'white'],
}
