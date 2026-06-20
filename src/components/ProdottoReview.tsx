'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { inserisciFood } from '@/app/(app)/actions';
import { scalePer100 } from '@/lib/nutrition/totals';
import type { ProdottoOFF } from '@/lib/off';
import { LABEL_PASTO, TIPI_PASTO, type TipoPasto, type Fonte } from '@/lib/supabase/types';

export function ProdottoReview({
  prodotto,
  data,
  pasto,
  fonte,
  onIndietro,
}: {
  prodotto: ProdottoOFF;
  data: string;
  pasto: TipoPasto;
  fonte: Fonte;
  onIndietro?: () => void;
}) {
  const router = useRouter();
  const [grammi, setGrammi] = useState('100');
  const [pastoSel, setPastoSel] = useState<TipoPasto>(pasto);
  const [pending, start] = useTransition();
  const [errore, setErrore] = useState<string | null>(null);

  const g = Number(grammi) || 0;
  const scaled = scalePer100(prodotto.per100g, g);
  const nome = prodotto.marca ? `${prodotto.nome} (${prodotto.marca})` : prodotto.nome;

  function salva() {
    start(async () => {
      const res = await inserisciFood({
        data,
        tipo_pasto: pastoSel,
        nome,
        grammi: g,
        fonte,
        nutrients: scaled,
      });
      if (res.error) setErrore(res.error);
      else router.push(`/?d=${data}`);
    });
  }

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-3">
        {prodotto.immagine && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={prodotto.immagine} alt="" className="h-14 w-14 rounded-xl object-cover" />
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold">{prodotto.nome}</p>
          {prodotto.marca && <p className="text-sm text-muted">{prodotto.marca}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="label">Grammi</span>
          <input type="number" inputMode="decimal" value={grammi} onChange={(e) => setGrammi(e.target.value)} className="input" />
        </label>
        <label className="block">
          <span className="label">Pasto</span>
          <select value={pastoSel} onChange={(e) => setPastoSel(e.target.value as TipoPasto)} className="input">
            {TIPI_PASTO.map((t) => (
              <option key={t} value={t}>
                {LABEL_PASTO[t]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center text-sm">
        <Stat label="kcal" value={Math.round(scaled.kcal)} color="var(--kcal)" />
        <Stat label="P" value={round1(scaled.proteine_g)} color="var(--proteine)" />
        <Stat label="C" value={round1(scaled.carboidrati_g)} color="var(--carboidrati)" />
        <Stat label="G" value={round1(scaled.grassi_g)} color="var(--grassi)" />
      </div>

      {errore && <p className="text-sm font-medium text-proteine">{errore}</p>}

      <div className="flex gap-2">
        {onIndietro && (
          <button onClick={onIndietro} className="btn-ghost flex-1">
            Indietro
          </button>
        )}
        <button onClick={salva} disabled={pending} className="btn-primary flex-1">
          {pending ? 'Salvo…' : 'Salva'}
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl bg-background py-2">
      <p className="font-bold tabular-nums" style={{ color }}>
        {value}
      </p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
