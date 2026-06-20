// Tipi che rispecchiano lo schema Postgres (supabase/migrations/0001_init.sql).
import type { Sesso, LivelloAttivita, Obiettivo } from '@/lib/nutrition/energy';
import type { Nutrients } from '@/lib/nutrition/types';

export type TipoPasto = 'colazione' | 'pranzo' | 'cena' | 'spuntino';
export type Fonte = 'foto' | 'barcode' | 'ricerca' | 'manuale';
export type Ruolo = 'admin' | 'user';

export const TIPI_PASTO: TipoPasto[] = ['colazione', 'pranzo', 'cena', 'spuntino'];

export const LABEL_PASTO: Record<TipoPasto, string> = {
  colazione: 'Colazione',
  pranzo: 'Pranzo',
  cena: 'Cena',
  spuntino: 'Spuntini',
};

export type Profile = {
  id: string;
  sesso: Sesso | null;
  eta: number | null;
  altezza_cm: number | null;
  peso_kg: number | null;
  obiettivo: Obiettivo | null;
  livello_attivita: LivelloAttivita | null;
  kcal_target: number | null;
  proteine_target_g: number | null;
  carbo_target_g: number | null;
  grassi_target_g: number | null;
  ruolo: Ruolo;
  created_at: string;
};

export type FoodEntry = {
  id: string;
  user_id: string;
  data: string; // YYYY-MM-DD
  tipo_pasto: TipoPasto;
  nome: string;
  grammi: number;
  fonte: Fonte;
  created_at: string;
} & Nutrients;

export type WeightLog = {
  id: string;
  user_id: string;
  data: string;
  peso_kg: number;
  created_at: string;
};

export type ExerciseLog = {
  id: string;
  user_id: string;
  data: string;
  attivita: string;
  kcal_bruciate: number;
  created_at: string;
};

/** Profilo con i target calcolati (non null) — comodo dopo l'onboarding. */
export function hasTargets(
  p: Profile | null,
): p is Profile & { kcal_target: number } {
  return !!p && p.kcal_target != null;
}
