'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createServer } from '@/lib/supabase/server';

const schema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  attivita: z.string().min(1).max(80),
  kcal_bruciate: z.coerce.number().min(0).max(10000),
});

export async function aggiungiEsercizio(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect('/attivita?error=1');
  const v = parsed.data;

  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await supabase.from('exercise_logs').insert({
    user_id: user.id,
    data: v.data,
    attivita: v.attivita,
    kcal_bruciate: Math.round(v.kcal_bruciate),
  });
  if (error) redirect('/attivita?error=1');

  revalidatePath('/');
  redirect(`/?d=${v.data}`);
}

export async function eliminaEsercizio(id: string) {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessione scaduta' };
  const { error } = await supabase.from('exercise_logs').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/');
  return { ok: true };
}
