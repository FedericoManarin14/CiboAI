import { describe, it, expect } from 'vitest';
import { sumNutrients, scalePer100, rescaleByGrams } from './totals';

describe('sumNutrients', () => {
  it('somma kcal e macro di più alimenti', () => {
    const t = sumNutrients([
      { kcal: 200, proteine_g: 10, carboidrati_g: 30, grassi_g: 5 },
      { kcal: 150, proteine_g: 8, carboidrati_g: 12, grassi_g: 7, fibre_g: 3 },
    ]);
    expect(t.kcal).toBe(350);
    expect(t.proteine_g).toBe(18);
    expect(t.carboidrati_g).toBe(42);
    expect(t.grassi_g).toBe(12);
    expect(t.fibre_g).toBe(3);
  });

  it('lista vuota → tutti zero', () => {
    const t = sumNutrients([]);
    expect(t.kcal).toBe(0);
    expect(t.vit_c_mg).toBe(0);
  });
});

describe('scalePer100', () => {
  it('scala valori per 100g a 250g', () => {
    const t = scalePer100({ kcal: 100, proteine_g: 4, sodio_mg: 40 }, 250);
    expect(t.kcal).toBe(250);
    expect(t.proteine_g).toBe(10);
    expect(t.sodio_mg).toBe(100);
  });
});

describe('rescaleByGrams', () => {
  it('raddoppia i nutrienti passando da 100g a 200g', () => {
    const t = rescaleByGrams({ kcal: 120, proteine_g: 6 }, 100, 200);
    expect(t.kcal).toBe(240);
    expect(t.proteine_g).toBe(12);
  });
  it('da quantità 0 → zero', () => {
    const t = rescaleByGrams({ kcal: 120 }, 0, 200);
    expect(t.kcal).toBe(0);
  });
});
