'use client';

import { useMemo, useState } from 'react';
import { ATTIVITA_COMUNI, stimaKcal } from '@/lib/exercise';
import { aggiungiEsercizio } from './actions';

export function AttivitaForm({ data, pesoKg }: { data: string; pesoKg: number }) {
  const [idx, setIdx] = useState(0);
  const [minuti, setMinuti] = useState('30');
  const [kcal, setKcal] = useState('');
  const [custom, setCustom] = useState('');

  const att = ATTIVITA_COMUNI[idx];
  const stima = useMemo(
    () => stimaKcal(att.met, pesoKg || 70, Number(minuti) || 0),
    [att, pesoKg, minuti],
  );
  const kcalFinali = kcal !== '' ? kcal : String(stima);
  const nome = custom.trim() || att.nome;

  return (
    <form action={aggiungiEsercizio} className="card p-5 space-y-4">
      <input type="hidden" name="data" value={data} />
      <input type="hidden" name="attivita" value={nome} />
      <input type="hidden" name="kcal_bruciate" value={kcalFinali} />

      <label className="block">
        <span className="label">Attività</span>
        <select value={idx} onChange={(e) => setIdx(Number(e.target.value))} className="input">
          {ATTIVITA_COMUNI.map((a, i) => (
            <option key={a.nome} value={i}>
              {a.nome}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="label">Oppure nome personalizzato</span>
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="(opzionale)"
          className="input"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="label">Minuti</span>
          <input
            type="number"
            inputMode="numeric"
            value={minuti}
            onChange={(e) => {
              setMinuti(e.target.value);
              setKcal('');
            }}
            className="input"
          />
        </label>
        <label className="block">
          <span className="label">kcal bruciate</span>
          <input
            type="number"
            inputMode="numeric"
            value={kcalFinali}
            onChange={(e) => setKcal(e.target.value)}
            className="input"
          />
        </label>
      </div>

      <p className="text-xs text-muted">Stima: ~{stima} kcal (modificabile).</p>

      <button type="submit" className="btn-primary w-full">
        Aggiungi attività
      </button>
    </form>
  );
}
