import { createServer } from './server';
import type { Profile, FoodEntry, ExerciseLog, WeightLog } from './types';

/** Utente autenticato o null. */
export async function getUser() {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createServer();
  const { data } = await supabase.from('profiles').select('*').single();
  return (data as Profile) ?? null;
}

export async function getFoodEntries(data: string): Promise<FoodEntry[]> {
  const supabase = await createServer();
  const { data: rows } = await supabase
    .from('food_entries')
    .select('*')
    .eq('data', data)
    .order('created_at', { ascending: true });
  return (rows as FoodEntry[]) ?? [];
}

export async function getExerciseLogs(data: string): Promise<ExerciseLog[]> {
  const supabase = await createServer();
  const { data: rows } = await supabase
    .from('exercise_logs')
    .select('*')
    .eq('data', data)
    .order('created_at', { ascending: true });
  return (rows as ExerciseLog[]) ?? [];
}

export async function getWeightLogs(limit = 90): Promise<WeightLog[]> {
  const supabase = await createServer();
  const { data: rows } = await supabase
    .from('weight_logs')
    .select('*')
    .order('data', { ascending: true })
    .limit(limit);
  return (rows as WeightLog[]) ?? [];
}

/** kcal totali consumate e bruciate per un giorno (per i grafici storico). */
export async function getDailyKcal(da: string, a: string) {
  const supabase = await createServer();
  const { data } = await supabase
    .from('food_entries')
    .select('data, kcal')
    .gte('data', da)
    .lte('data', a);
  return (data as { data: string; kcal: number }[]) ?? [];
}
