'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { inserisciFood } from '@/app/(app)/actions';
import { MICRO_FIELDS, NUTRIENT_META, type Nutrients } from '@/lib/nutrition/types';
import { LABEL_PASTO, TIPI_PASTO, type TipoPasto } from '@/lib/supabase/types';

export function ManualeForm({ data, pasto }: { data: string; pasto: TipoPasto }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [errore, setErrore] = useState<string | null>(null);
  const [showMicro, setShowMicro] = useState(false);

  const [nome, setNome] = useState('');
  const [grammi, setGrammi] = useState('100');
  const [pastoSel, setPastoSel] = useState<TipoPasto>(pasto);
  const [macro, setMacro] = useState({ kcal: '', proteine_g: '', carboidrati_g: '', grassi_g: '' });
  const [micro, setMicro] = useState<Record<string, string>>({});

  function salva() {
    if (!nome.trim()) {
      setErrore('Inserisci un nome.');
      return;
    }
    setErrore(null);
    const nutrients: Partial<Nutrients> = {
      kcal: Number(macro.kcal) || 0,
      proteine_g: Number(macro.proteine_g) || 0,
      carboidrati_g: Number(macro.carboidrati_g) || 0,
      grassi_g: Number(macro.grassi_g) || 0,
    };
    for (const f of MICRO_FIELDS) nutrients[f] = Number(micro[f]) || 0;

    start(async () => {
      const res = await inserisciFood({
        data,
        tipo_pasto: pastoSel,
        nome: nome.trim(),
        grammi: Number(grammi) || 0,
        fonte: 'manuale',
        nutrients,
      });
      if (res.error) setErrore(res.error);
      else router.push(`/?d=${data}`);
    });
  }

  return (
    <div className="card p-5 space-y-4">
      <label className="block">
        <span className="label">Nome alimento</span>
        <input value={nome} onChange={(e) => setNome(e.target.value)} className="input" placeholder="Es. Petto di pollo" />
      </label>

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

      <p className="text-xs text-muted">Valori riferiti alla quantità totale inserita.</p>

      <div className="grid grid-cols-2 gap-3">
        <Num label="Calorie (kcal)" value={macro.kcal} onChange={(v) => setMacro({ ...macro, kcal: v })} />
        <Num label="Proteine (g)" value={macro.proteine_g} onChange={(v) => setMacro({ ...macro, proteine_g: v })} />
        <Num label="Carboidrati (g)" value={macro.carboidrati_g} onChange={(v) => setMacro({ ...macro, carboidrati_g: v })} />
        <Num label="Grassi (g)" value={macro.grassi_g} onChange={(v) => setMacro({ ...macro, grassi_g: v })} />
      </div>

      <button onClick={() => setShowMicro((s) => !s)} className="text-sm font-medium text-brand-600">
        {showMicro ? '− Nascondi' : '+ Aggiungi'} micronutrienti
      </button>
      {showMicro && (
        <div className="grid grid-cols-2 gap-3">
          {MICRO_FIELDS.map((f) => (
            <Num
              key={f}
              label={`${NUTRIENT_META[f].label} (${NUTRIENT_META[f].unit})`}
              value={micro[f] ?? ''}
              onChange={(v) => setMicro({ ...micro, [f]: v })}
            />
          ))}
        </div>
      )}

      {errore && <p className="text-sm font-medium text-proteine">{errore}</p>}

      <button onClick={salva} disabled={pending} className="btn-primary w-full">
        {pending ? 'Salvo…' : 'Salva alimento'}
      </button>
    </div>
  );
}

function Num({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
        placeholder="0"
      />
    </label>
  );
}
