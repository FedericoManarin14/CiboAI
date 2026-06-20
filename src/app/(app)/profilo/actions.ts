'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServer } from '@/lib/supabase/server';
import { calcolaTargets } from '@/lib/nutrition/profile';
import { oggiISO } from '@/lib/date';

const schema = z.object({
  sesso: z.enum(['uomo', 'donna']),
  eta: z.coerce.number().int().min(10).max(120),
  altezza_cm: z.coerce.number().int().min(100).max(250),
  peso_kg: z.coerce.number().min(30).max(400),
  obiettivo: z.enum(['dimagrire', 'mantenere', 'aumentare']),
  livello_attivita: z.enum(['sedentario', 'leggero', 'moderato', 'attivo', 'molto_attivo']),
});

export async function salvaProfilo(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect('/profilo?error=1');
  }
  const p = parsed.data;

  const targets = calcolaTargets({
    sesso: p.sesso,
    pesoKg: p.peso_kg,
    altezzaCm: p.altezza_cm,
    eta: p.eta,
    livello: p.livello_attivita,
    obiettivo: p.obiettivo,
  });

  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await supabase
    .from('profiles')
    .update({
      sesso: p.sesso,
      eta: p.eta,
      altezza_cm: p.altezza_cm,
      peso_kg: p.peso_kg,
      obiettivo: p.obiettivo,
      livello_attivita: p.livello_attivita,
      ...targets,
    })
    .eq('id', user.id);

  if (error) redirect('/profilo?error=1');

  // Registra anche il peso di oggi per i grafici.
  await supabase
    .from('weight_logs')
    .upsert({ user_id: user.id, data: oggiISO(), peso_kg: p.peso_kg }, { onConflict: 'user_id,data' });

  revalidatePath('/');
  revalidatePath('/profilo');
  redirect('/profilo?ok=1');
}
