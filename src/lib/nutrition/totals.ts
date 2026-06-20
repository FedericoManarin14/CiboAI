import { NUTRIENT_FIELDS, emptyNutrients, type Nutrients } from './types';

/** Somma i nutrienti di una lista di alimenti, campo per campo. */
export function sumNutrients(items: Array<Partial<Nutrients>>): Nutrients {
  const total = emptyNutrients();
  for (const item of items) {
    for (const f of NUTRIENT_FIELDS) {
      total[f] += Number(item[f] ?? 0);
    }
  }
  return total;
}

/** Scala nutrienti espressi per 100 g a una quantità in grammi. */
export function scalePer100(per100: Partial<Nutrients>, grammi: number): Nutrients {
  const factor = grammi / 100;
  const out = emptyNutrients();
  for (const f of NUTRIENT_FIELDS) {
    out[f] = round2((Number(per100[f] ?? 0)) * factor);
  }
  return out;
}

/** Riscala i nutrienti di un alimento da una quantità in grammi a un'altra. */
export function rescaleByGrams(
  nutrients: Partial<Nutrients>,
  daGrammi: number,
  aGrammi: number,
): Nutrients {
  if (daGrammi <= 0) return emptyNutrients();
  const factor = aGrammi / daGrammi;
  const out = emptyNutrients();
  for (const f of NUTRIENT_FIELDS) {
    out[f] = round2(Number(nutrients[f] ?? 0) * factor);
  }
  return out;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
