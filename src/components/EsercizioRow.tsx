'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { eliminaEsercizio } from '@/app/(app)/attivita/actions';
import type { ExerciseLog } from '@/lib/supabase/types';

export function EsercizioRow({ log }: { log: ExerciseLog }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function rimuovi() {
    start(async () => {
      await eliminaEsercizio(log.id);
      router.refresh();
    });
  }

  return (
    <li className="flex items-center justify-between gap-3 border-t border-border py-2.5 first:border-t-0">
      <span className="min-w-0 truncate font-medium">{log.attivita}</span>
      <div className="flex shrink-0 items-center gap-3">
        <span className="font-semibold tabular-nums text-brand-600">
          +{Math.round(log.kcal_bruciate)} kcal
        </span>
        <button
          onClick={rimuovi}
          disabled={pending}
          aria-label="Elimina attività"
          className="text-muted hover:text-proteine"
        >
          ✕
        </button>
      </div>
    </li>
  );
}
