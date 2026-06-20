// Attività comuni con valore MET. kcal = MET × 3.5 × pesoKg / 200 × minuti.

export type Attivita = { nome: string; met: number };

export const ATTIVITA_COMUNI: Attivita[] = [
  { nome: 'Camminata', met: 3.5 },
  { nome: 'Camminata veloce', met: 5.0 },
  { nome: 'Corsa', met: 9.8 },
  { nome: 'Bicicletta', met: 7.5 },
  { nome: 'Nuoto', met: 7.0 },
  { nome: 'Palestra / pesi', met: 5.0 },
  { nome: 'Ellittica', met: 5.0 },
  { nome: 'Calcio', met: 7.0 },
  { nome: 'Tennis / padel', met: 7.3 },
  { nome: 'Yoga', met: 2.5 },
  { nome: 'Escursionismo', met: 6.0 },
];

export function stimaKcal(met: number, pesoKg: number, minuti: number): number {
  return Math.round((met * 3.5 * pesoKg) / 200 * minuti);
}
