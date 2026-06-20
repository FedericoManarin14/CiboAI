'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { aggiornaFood, eliminaFood } from '@/app/(app)/actions';
import { rescaleByGrams } from '@/lib/nutrition/totals';
import { LABEL_PASTO, TIPI_PASTO, type FoodEntry, type TipoPasto } from '@/lib/supabase/types';

export function FoodEntryRow({ entry }: { entry: FoodEntry }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [grammi, setGrammi] = useState(String(entry.grammi));
  const [pasto, setPasto] = useState<TipoPasto>(entry.tipo_pasto);
  const [pending, start] = useTransition();

  const nuoviGrammi = Number(grammi) || 0;
  const kcalPreview = entry.grammi > 0 ? Math.round((entry.kcal / entry.grammi) * nuoviGrammi) : 0;

  function salva() {
    start(async () => {
      const nutrients = rescaleByGrams(entry, entry.grammi, nuoviGrammi);
      await aggiornaFood(entry.id, { grammi: nuoviGrammi, tipo_pasto: pasto, nutrients });
      setOpen(false);
      router.refresh();
    });
  }

  function rimuovi() {
    start(async () => {
      await eliminaFood(entry.id);
      router.refresh();
    });
  }

  return (
    <li className="border-t border-border first:border-t-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 py-2.5 text-left active:bg-background"
      >
        <span className="min-w-0">
          <span className="block truncate font-medium">{entry.nome}</span>
          <span className="text-xs text-muted">{Math.round(entry.grammi)} g</span>
        </span>
        <span className="shrink-0 font-semibold tabular-nums">{Math.round(entry.kcal)} kcal</span>
      </button>

      {open && (
        <div className="space-y-3 pb-3">
          <div className="flex items-end gap-3">
            <label className="flex-1">
              <span className="label">Grammi</span>
              <input
                type="number"
                inputMode="decimal"
                value={grammi}
                onChange={(e) => setGrammi(e.target.value)}
                className="input"
              />
            </label>
            <label className="flex-1">
              <span className="label">Pasto</span>
              <select value={pasto} onChange={(e) => setPasto(e.target.value as TipoPasto)} className="input">
                {TIPI_PASTO.map((t) => (
                  <option key={t} value={t}>
                    {LABEL_PASTO[t]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="text-xs text-muted">≈ {kcalPreview} kcal con i nuovi grammi</p>
          <div className="flex gap-2">
            <button onClick={salva} disabled={pending} className="btn-primary flex-1 py-2.5">
              Salva
            </button>
            <button
              onClick={rimuovi}
              disabled={pending}
              className="rounded-xl border border-proteine/40 px-4 py-2.5 font-medium text-proteine active:scale-[0.98]"
            >
              Elimina
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
