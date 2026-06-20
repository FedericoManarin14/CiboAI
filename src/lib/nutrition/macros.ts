export type MacroGrammi = {
  proteine_g: number;
  carboidrati_g: number;
  grassi_g: number;
};

export type MacroRatio = { p: number; c: number; g: number };

export const RATIO_DEFAULT: MacroRatio = { p: 0.3, c: 0.4, g: 0.3 };

/**
 * Divide le kcal obiettivo in grammi di macronutrienti.
 * Proteine e carboidrati 4 kcal/g, grassi 9 kcal/g.
 */
export function splitMacro(kcal: number, ratio: MacroRatio = RATIO_DEFAULT): MacroGrammi {
  return {
    proteine_g: Math.round((kcal * ratio.p) / 4),
    carboidrati_g: Math.round((kcal * ratio.c) / 4),
    grassi_g: Math.round((kcal * ratio.g) / 9),
  };
}
