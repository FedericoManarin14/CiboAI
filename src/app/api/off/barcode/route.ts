import { NextResponse } from 'next/server';
import { cercaBarcode } from '@/lib/off';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'Codice mancante' }, { status: 400 });
  const prodotto = await cercaBarcode(code);
  if (!prodotto) return NextResponse.json({ error: 'Prodotto non trovato' }, { status: 404 });
  return NextResponse.json({ prodotto });
}
