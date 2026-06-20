'use server';

import { revalidatePath } from 'next/cache';
import { createServer } from '@/lib/supabase/server';
import { emptyNutrients, NUTRIENT_FIELDS, type Nutrients } from '@/lib/nutrition/types';
import type { TipoPasto, Fonte } from '@/lib/supabase/types';

export type FoodInput = {
  data: string;
  tipo_pasto: TipoPasto;
  nome: string;
  grammi: number;
  fonte: Fonte;
  nutrients: Partial<Nutrients>;
};

async function userId() {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, uid: user?.id };
}

/** Inserisce un alimento. Usato da foto/barcode/ricerca/manuale. */
export async function inserisciFood(input: FoodInput) {
  const { supabase, uid } = await userId();
  if (!uid) return { error: 'Sessione scaduta' };

  const nutrients = { ...emptyNutrients() };
  for (const f of NUTRIENT_FIELDS) nutrients[f] = Number(input.nutrients[f] ?? 0);

  const { error } = await supabase.from('food_entries').insert({
    user_id: uid,
    data: input.data,
    tipo_pasto: input.tipo_pasto,
    nome: input.nome,
    grammi: input.grammi,
    fonte: input.fonte,
    ...nutrients,
  });

  if (error) return { error: error.message };
  revalidatePath('/');
  return { ok: true };
}

/** Inserisce più alimenti in un colpo (foto con più ingredienti). */
export async function inserisciFoods(inputs: FoodInput[]) {
  const { supabase, uid } = await userId();
  if (!uid) return { error: 'Sessione scaduta' };

  const rows = inputs.map((input) => {
    const nutrients = { ...emptyNutrients() };
    for (const f of NUTRIENT_FIELDS) nutrients[f] = Number(input.nutrients[f] ?? 0);
    return {
      user_id: uid,
      data: input.data,
      tipo_pasto: input.tipo_pasto,
      nome: input.nome,
      grammi: input.grammi,
      fonte: input.fonte,
      ...nutrients,
    };
  });

  const { error } = await supabase.from('food_entries').insert(rows);
  if (error) return { error: error.message };
  revalidatePath('/');
  return { ok: true };
}

export async function eliminaFood(id: string) {
  const { supabase, uid } = await userId();
  if (!uid) return { error: 'Sessione scaduta' };
  const { error } = await supabase.from('food_entries').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/');
  return { ok: true };
}

/** Aggiorna grammi → riscala tutti i nutrienti, oppure cambia pasto. */
export async function aggiornaFood(
  id: string,
  patch: { grammi?: number; tipo_pasto?: TipoPasto; nutrients?: Partial<Nutrients> },
) {
  const { supabase, uid } = await userId();
  if (!uid) return { error: 'Sessione scaduta' };

  const update: Record<string, unknown> = {};
  if (patch.tipo_pasto) update.tipo_pasto = patch.tipo_pasto;
  if (patch.grammi != null) update.grammi = patch.grammi;
  if (patch.nutrients) {
    for (const f of NUTRIENT_FIELDS) {
      if (patch.nutrients[f] != null) update[f] = patch.nutrients[f];
    }
  }

  const { error } = await supabase.from('food_entries').update(update).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/');
  return { ok: true };
}
