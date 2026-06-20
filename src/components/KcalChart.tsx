'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from 'recharts';

export type PuntoKcal = { etichetta: string; kcal: number };

export function KcalChart({ dati, target }: { dati: PuntoKcal[]; target: number | null }) {
  if (dati.every((d) => d.kcal === 0)) {
    return <p className="py-8 text-center text-sm text-muted">Nessun pasto registrato negli ultimi giorni.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={dati} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="etichetta" tick={{ fontSize: 11, fill: 'var(--muted)' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} tickLine={false} axisLine={false} width={36} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', fontSize: 12 }}
          formatter={(value) => [`${value} kcal`, 'Consumate']}
          cursor={{ fill: 'var(--ring-track)' }}
        />
        {target != null && <ReferenceLine y={target} stroke="var(--muted)" strokeDasharray="4 4" />}
        <Bar dataKey="kcal" radius={[6, 6, 0, 0]}>
          {dati.map((d, i) => (
            <Cell key={i} fill={target != null && d.kcal > target ? 'var(--proteine)' : 'var(--kcal)'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
