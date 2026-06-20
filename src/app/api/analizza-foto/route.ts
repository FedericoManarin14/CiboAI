import { NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase/server';
import { analizzaFoto, GeminiError } from '@/lib/gemini';

export const runtime = 'nodejs';
export const maxDuration = 30;

const MAX_BYTES = 6 * 1024 * 1024; // 6 MB

export async function POST(request: Request) {
  // Richiede sessione valida.
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    file = form.get('foto') as File | null;
  } catch {
    return NextResponse.json({ error: 'Richiesta non valida' }, { status: 400 });
  }

  if (!file || file.size === 0) {
    return NextResponse.json({ error: 'Nessuna foto ricevuta' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Foto troppo grande (max 6 MB)' }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString('base64');
  const mimeType = file.type || 'image/jpeg';

  try {
    const risultato = await analizzaFoto(base64, mimeType);
    // La foto (base64/buffer) viene scartata: non salvata da nessuna parte.
    return NextResponse.json(risultato);
  } catch (e) {
    const msg =
      e instanceof GeminiError
        ? e.message
        : "L'analisi è fallita. Riprova o inserisci manualmente.";
    return NextResponse.json({ error: msg }, { status: 422 });
  }
}
