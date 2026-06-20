'use client';

import { useRef, useState } from 'react';
import { ProdottoReview } from '@/components/ProdottoReview';
import type { ProdottoOFF } from '@/lib/off';
import type { TipoPasto } from '@/lib/supabase/types';

export function RicercaClient({ data, pasto }: { data: string; pasto: TipoPasto }) {
  const [q, setQ] = useState('');
  const [risultati, setRisultati] = useState<ProdottoOFF[]>([]);
  const [loading, setLoading] = useState(false);
  const [cercato, setCercato] = useState(false);
  const [scelto, setScelto] = useState<ProdottoOFF | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onChange(val: string) {
    setQ(val);
    if (timer.current) clearTimeout(timer.current);
    if (val.trim().length < 2) {
      setRisultati([]);
      setCercato(false);
      return;
    }
    timer.current = setTimeout(() => cerca(val), 400);
  }

  async function cerca(val: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/off/search?q=${encodeURIComponent(val)}`);
      const json = await res.json();
      setRisultati(json.prodotti ?? []);
      setCercato(true);
    } finally {
      setLoading(false);
    }
  }

  if (scelto) {
    return (
      <ProdottoReview
        prodotto={scelto}
        data={data}
        pasto={pasto}
        fonte="ricerca"
        onIndietro={() => setScelto(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <input
        autoFocus
        value={q}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cerca un prodotto…"
        className="input"
      />

      {loading && <p className="text-sm text-muted">Ricerca…</p>}

      {!loading && cercato && risultati.length === 0 && (
        <p className="text-sm text-muted">Nessun prodotto trovato.</p>
      )}

      <ul className="space-y-2">
        {risultati.map((p) => (
          <li key={p.code || p.nome}>
            <button onClick={() => setScelto(p)} className="card flex w-full items-center gap-3 p-3 text-left active:scale-[0.99]">
              {p.immagine && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.immagine} alt="" className="h-12 w-12 rounded-lg object-cover" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{p.nome}</span>
                <span className="text-xs text-muted">
                  {p.marca ? `${p.marca} · ` : ''}
                  {Math.round(p.per100g.kcal)} kcal/100g
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
