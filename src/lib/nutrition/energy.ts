export type Sesso = 'uomo' | 'donna';
export type LivelloAttivita =
  | 'sedentario'
  | 'leggero'
  | 'moderato'
  | 'attivo'
  | 'molto_attivo';
export type Obiettivo = 'dimagrire' | 'mantenere' | 'aumentare';

/** BMR con la formula di Mifflin-St Jeor (kcal/giorno). */
export function bmrMifflin(p: {
  sesso: Sesso;
  pesoKg: number;
  altezzaCm: number;
  eta: number;
}): number {
  const base = 10 * p.pesoKg + 6.25 * p.altezzaCm - 5 * p.eta;
  return p.sesso === 'uomo' ? base + 5 : base - 161;
}

export const MOLTIPLICATORE_ATTIVITA: Record<LivelloAttivita, number> = {
  sedentario: 1.2,
  leggero: 1.375,
  moderato: 1.55,
  attivo: 1.725,
  molto_attivo: 1.9,
};

/** TDEE = BMR × moltiplicatore del livello di attività. */
export function tdee(bmr: number, livello: LivelloAttivita): number {
  return bmr * MOLTIPLICATORE_ATTIVITA[livello];
}

export const OFFSET_OBIETTIVO: Record<Obiettivo, number> = {
  dimagrire: -500,
  mantenere: 0,
  aumentare: 400,
};

/** Obiettivo kcal giornaliero = TDEE (arrotondato) + offset secondo l'obiettivo. */
export function kcalObiettivo(tdeeVal: number, obiettivo: Obiettivo): number {
  return Math.round(tdeeVal) + OFFSET_OBIETTIVO[obiettivo];
}
