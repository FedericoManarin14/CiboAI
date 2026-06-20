'use client';

import { useState } from 'react';
import { MICRO_FIELDS, NUTRIENT_META, type Nutrients } from '@/lib/nutrition/types';

export function MicroPanel({ totals }: { totals: Nutrients }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-border pt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-sm font-medium text-muted"
      >
        Micronutrienti
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
          {MICRO_FIELDS.map((f) => {
            const meta = NUTRIENT_META[f];
            const val = totals[f] ?? 0;
            const pct = meta.rda ? Math.round((val / meta.rda) * 100) : null;
            return (
              <div key={f}>
                <div className="flex items-baseline justify-between text-sm">
                  <dt className="text-muted">{meta.label}</dt>
                  <dd className="font-medium tabular-nums">
                    {round1(val)} {meta.unit}
                  </dd>
                </div>
                {pct != null && (
                  <div className="mt-1 h-1 rounded-full bg-[var(--ring-track)]">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </dl>
      )}
    </div>
  );
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
