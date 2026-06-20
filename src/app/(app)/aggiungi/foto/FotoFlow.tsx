'use client';

import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { inserisciFoods, type FoodInput } from '@/app/(app)/actions';
import { rescaleByGrams } from '@/lib/nutrition/totals';
import { type Nutrients } from '@/lib/nutrition/types';
import { LABEL_PASTO, TIPI_PASTO, type TipoPasto } from '@/lib/supabase/types';
import type { IngredienteAI } from '@/lib/ai-schema';

type Item = {
  id: number;
  nome: string;
  grammi: string;
  baseGrammi: number;
  baseNutrients: Nutrients;
};

type Fase = 'scatta' | 'analizza' | 'revisione' | 'errore';

let counter = 0;

export function FotoFlow({ data, pasto }: { data: string; pasto: TipoPasto }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fase, setFase] = useState<Fase>('scatta');
  const [anteprima, setAnteprima] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [pastoSel, setPastoSel] = useState<TipoPasto>(pasto);
  const [errore, setErrore] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onFile(f: File) {
    setFile(f);
    setAnteprima(URL.createObjectURL(f));
    setFase('scatta');
  }

  async function analizza() {
    if (!file) return;
    setFase('analizza');
    setErrore(null);
    try {
      const fd = new FormData();
      fd.append('foto', file);
      const res = await fetch('/api/analizza-foto', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) {
        setErrore(json.error ?? 'Analisi fallita.');
        setFase('errore');
        return;
      }
      const ingredienti = json.ingredienti as IngredienteAI[];
      setItems(
        ingredienti.map((ing) => {
          const { nome, grammi, ...rest } = ing;
          return {
            id: counter++,
            nome,
            grammi: String(Math.round(grammi)),
            baseGrammi: grammi,
            baseNutrients: rest as unknown as Nutrients,
          };
        }),
      );
      setFase('revisione');
    } catch {
      setErrore('Errore di rete. Riprova.');
      setFase('errore');
    }
  }

  function nutrientiCorrenti(it: Item): Nutrients {
    return rescaleByGrams(it.baseNutrients, it.baseGrammi, Number(it.grammi) || 0);
  }

  const totaleKcal = Math.round(items.reduce((s, it) => s + nutrientiCorrenti(it).kcal, 0));

  function salva() {
    const inputs: FoodInput[] = items
      .filter((it) => it.nome.trim() && Number(it.grammi) > 0)
      .map((it) => ({
        data,
        tipo_pasto: pastoSel,
        nome: it.nome.trim(),
        grammi: Number(it.grammi),
        fonte: 'foto',
        nutrients: nutrientiCorrenti(it),
      }));
    if (inputs.length === 0) return;
    start(async () => {
      const res = await inserisciFoods(inputs);
      if (res.error) {
        setErrore(res.error);
        setFase('errore');
      } else {
        router.push(`/?d=${data}`);
      }
    });
  }

  // ---- Render ----
  if (fase === 'analizza') {
    return (
      <div className="card p-8 text-center">
        {anteprima && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={anteprima} alt="" className="mx-auto mb-4 h-40 w-40 rounded-2xl object-cover opacity-70" />
        )}
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <p className="mt-4 font-medium">Analisi in corso…</p>
        <p className="text-sm text-muted">L&apos;AI sta riconoscendo gli ingredienti.</p>
      </div>
    );
  }

  if (fase === 'errore') {
    return (
      <div className="card p-6 text-center space-y-4">
        <p className="text-4xl">😕</p>
        <p className="font-medium">{errore}</p>
        <div className="flex flex-col gap-2">
          <button onClick={() => setFase('scatta')} className="btn-ghost">
            Riprova con un&apos;altra foto
          </button>
          <Link href={`/aggiungi/manuale?pasto=${pastoSel}&data=${data}`} className="btn-primary">
            Inserisci manualmente
          </Link>
        </div>
      </div>
    );
  }

  if (fase === 'revisione') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Rivedi e correggi</p>
          <span className="text-sm text-muted tabular-nums">{totaleKcal} kcal totali</span>
        </div>

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

        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.id} className="card p-3">
              <div className="flex items-center gap-2">
                <input
                  value={it.nome}
                  onChange={(e) =>
                    setItems((arr) => arr.map((x) => (x.id === it.id ? { ...x, nome: e.target.value } : x)))
                  }
                  className="input flex-1 py-2"
                />
                <button
                  onClick={() => setItems((arr) => arr.filter((x) => x.id !== it.id))}
                  aria-label="Rimuovi"
                  className="px-2 text-muted hover:text-proteine"
                >
                  ✕
                </button>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={it.grammi}
                    onChange={(e) =>
                      setItems((arr) => arr.map((x) => (x.id === it.id ? { ...x, grammi: e.target.value } : x)))
                    }
                    className="input w-24 py-2"
                  />
                  <span className="text-muted">g</span>
                </label>
                <span className="ml-auto text-sm font-semibold tabular-nums">
                  {Math.round(nutrientiCorrenti(it).kcal)} kcal
                </span>
              </div>
            </li>
          ))}
        </ul>

        <button
          onClick={() =>
            setItems((arr) => [
              ...arr,
              { id: counter++, nome: '', grammi: '100', baseGrammi: 100, baseNutrients: zeroNutrients() },
            ])
          }
          className="text-sm font-medium text-brand-600"
        >
          + Aggiungi ingrediente
        </button>

        <button onClick={salva} disabled={pending} className="btn-primary w-full">
          {pending ? 'Salvo…' : `Salva nel diario`}
        </button>
      </div>
    );
  }

  // fase 'scatta'
  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />

      {anteprima ? (
        <div className="card overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={anteprima} alt="Anteprima piatto" className="aspect-square w-full object-cover" />
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="card grid aspect-square w-full place-items-center text-center"
        >
          <div>
            <p className="text-5xl">📷</p>
            <p className="mt-2 font-medium">Scatta o scegli una foto</p>
            <p className="text-sm text-muted">del tuo piatto</p>
          </div>
        </button>
      )}

      {anteprima ? (
        <div className="flex flex-col gap-2">
          <button onClick={analizza} className="btn-primary w-full">
            Analizza foto
          </button>
          <button onClick={() => inputRef.current?.click()} className="btn-ghost w-full">
            Cambia foto
          </button>
        </div>
      ) : (
        <button onClick={() => inputRef.current?.click()} className="btn-primary w-full">
          Seleziona foto
        </button>
      )}
    </div>
  );
}

function zeroNutrients(): Nutrients {
  return {
    kcal: 0, proteine_g: 0, carboidrati_g: 0, grassi_g: 0, fibre_g: 0, zuccheri_g: 0,
    grassi_saturi_g: 0, sodio_mg: 0, potassio_mg: 0, calcio_mg: 0, ferro_mg: 0, magnesio_mg: 0,
    vit_a_ug: 0, vit_c_mg: 0, vit_d_ug: 0, vit_b12_ug: 0,
  };
}
