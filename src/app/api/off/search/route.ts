import { NextResponse } from 'next/server';
import { cercaNome } from '@/lib/off';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q')?.trim();
  if (!q || q.length < 2) return NextResponse.json({ prodotti: [] });
  const prodotti = await cercaNome(q);
  return NextResponse.json({ prodotti });
}
