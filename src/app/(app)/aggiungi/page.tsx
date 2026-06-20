import Link from 'next/link';
import { dataValidaOggi } from '@/lib/date';
import { LABEL_PASTO, TIPI_PASTO, type TipoPasto } from '@/lib/supabase/types';

export const metadata = { title: 'Aggiungi — CiboAI' };

const METODI = [
  { slug: 'foto', emoji: '📷', titolo: 'Foto', desc: "L'AI riconosce il piatto" },
  { slug: 'ricerca', emoji: '🔎', titolo: 'Cerca', desc: 'Per nome prodotto' },
  { slug: 'barcode', emoji: '📦', titolo: 'Barcode', desc: 'Scansiona il codice' },
  { slug: 'manuale', emoji: '✏️', titolo: 'Manuale', desc: 'Inserisci a mano' },
];

export default async function AggiungiPage({
  searchParams,
}: {
  searchParams: Promise<{ pasto?: string; data?: string }>;
}) {
  const { pasto, data: dataParam } = await searchParams;
  const data = dataValidaOggi(dataParam);
  const pastoSel = (TIPI_PASTO.includes(pasto as TipoPasto) ? pasto : 'pranzo') as TipoPasto;
  const qs = `pasto=${pastoSel}&data=${data}`;

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <Link href={`/?d=${data}`} aria-label="Indietro" className="text-2xl leading-none text-muted">
          ‹
        </Link>
        <h1 className="text-xl font-bold">Aggiungi a {LABEL_PASTO[pastoSel]}</h1>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {METODI.map((m) => (
          <Link
            key={m.slug}
            href={`/aggiungi/${m.slug}?${qs}`}
            className="card flex flex-col items-start gap-1 p-5 active:scale-[0.98] transition"
          >
            <span className="text-3xl">{m.emoji}</span>
            <span className="mt-1 font-semibold">{m.titolo}</span>
            <span className="text-xs text-muted">{m.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
