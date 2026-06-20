'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createServer } from '@/lib/supabase/server';
import { dataValidaOggi } from '@/lib/date';

const schema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  peso_kg: z.coerce.number().min(30).max(400),
});

export async function aggiungiPeso(formData: FormData) {
  const parsed = schema.safeParse({
    data: dataValidaOggi(String(formData.get('data') ?? '')),
    peso_kg: formData.get('peso_kg'),
  });
  if (!parsed.success) redirect('/storico?error=1');
  const v = parsed.data;

  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await supabase
    .from('weight_logs')
    .upsert({ user_id: user.id, data: v.data, peso_kg: v.peso_kg }, { onConflict: 'user_id,data' });
  if (error) redirect('/storico?error=1');

  revalidatePath('/storico');
  redirect('/storico?ok=1');
}
