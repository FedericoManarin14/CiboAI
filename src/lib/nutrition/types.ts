// Singola fonte di verità per i campi nutrizionali tracciati.
// Riusato da: schema AI (Zod), totali del diario, UI micronutrienti, tipi DB.

export const MACRO_FIELDS = ['kcal', 'proteine_g', 'carboidrati_g', 'grassi_g'] as const;

export const MICRO_FIELDS = [
  'fibre_g',
  'zuccheri_g',
  'grassi_saturi_g',
  'sodio_mg',
  'potassio_mg',
  'calcio_mg',
  'ferro_mg',
  'magnesio_mg',
  'vit_a_ug',
  'vit_c_mg',
  'vit_d_ug',
  'vit_b12_ug',
] as const;

export const NUTRIENT_FIELDS = [...MACRO_FIELDS, ...MICRO_FIELDS] as const;

export type MacroField = (typeof MACRO_FIELDS)[number];
export type MicroField = (typeof MICRO_FIELDS)[number];
export type NutrientField = (typeof NUTRIENT_FIELDS)[number];

/** Tutti i nutrienti come numeri. */
export type Nutrients = Record<NutrientField, number>;

type NutrientInfo = {
  label: string;
  unit: 'kcal' | 'g' | 'mg' | 'µg';
  /** Valore di riferimento giornaliero (NRV adulto) per la % giornaliera. */
  rda?: number;
  color?: string;
};

export const NUTRIENT_META: Record<NutrientField, NutrientInfo> = {
  kcal: { label: 'Calorie', unit: 'kcal', color: 'var(--kcal)' },
  proteine_g: { label: 'Proteine', unit: 'g', color: 'var(--proteine)' },
  carboidrati_g: { label: 'Carboidrati', unit: 'g', color: 'var(--carboidrati)' },
  grassi_g: { label: 'Grassi', unit: 'g', color: 'var(--grassi)' },
  fibre_g: { label: 'Fibre', unit: 'g', rda: 30 },
  zuccheri_g: { label: 'Zuccheri', unit: 'g', rda: 90 },
  grassi_saturi_g: { label: 'Grassi saturi', unit: 'g', rda: 20 },
  sodio_mg: { label: 'Sodio', unit: 'mg', rda: 2300 },
  potassio_mg: { label: 'Potassio', unit: 'mg', rda: 3500 },
  calcio_mg: { label: 'Calcio', unit: 'mg', rda: 1000 },
  ferro_mg: { label: 'Ferro', unit: 'mg', rda: 14 },
  magnesio_mg: { label: 'Magnesio', unit: 'mg', rda: 375 },
  vit_a_ug: { label: 'Vitamina A', unit: 'µg', rda: 800 },
  vit_c_mg: { label: 'Vitamina C', unit: 'mg', rda: 80 },
  vit_d_ug: { label: 'Vitamina D', unit: 'µg', rda: 15 },
  vit_b12_ug: { label: 'Vitamina B12', unit: 'µg', rda: 2.5 },
};

/** Oggetto Nutrients con tutti i campi a zero. */
export function emptyNutrients(): Nutrients {
  return NUTRIENT_FIELDS.reduce((acc, f) => {
    acc[f] = 0;
    return acc;
  }, {} as Nutrients);
}
