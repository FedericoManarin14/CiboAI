'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export type PuntoPeso = { etichetta: string; peso: number };

export function PesoChart({ dati }: { dati: PuntoPeso[] }) {
  if (dati.length < 2) {
    return <p className="py-8 text-center text-sm text-muted">Registra il peso per qualche giorno per vedere il grafico.</p>;
  }
  const valori = dati.map((d) => d.peso);
  const min = Math.floor(Math.min(...valori) - 1);
  const max = Math.ceil(Math.max(...valori) + 1);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={dati} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="etichetta" tick={{ fontSize: 11, fill: 'var(--muted)' }} tickLine={false} axisLine={false} />
        <YAxis domain={[min, max]} tick={{ fontSize: 11, fill: 'var(--muted)' }} tickLine={false} axisLine={false} width={36} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', fontSize: 12 }}
          formatter={(value) => [`${value} kg`, 'Peso']}
        />
        <Line type="monotone" dataKey="peso" stroke="var(--brand)" strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
