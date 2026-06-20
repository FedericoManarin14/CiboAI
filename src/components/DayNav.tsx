import Link from 'next/link';
import { addDays, etichettaGiorno, isFuturo } from '@/lib/date';

/** Navigazione tra i giorni del diario. Aggiorna ?d= via Link. */
export function DayNav({ data, base = '/' }: { data: string; base?: string }) {
  const prev = addDays(data, -1);
  const next = addDays(data, 1);
  const nextDisabled = isFuturo(next);
  const href = (d: string) => `${base}?d=${d}`;

  return (
    <div className="flex items-center justify-between">
      <Link href={href(prev)} aria-label="Giorno precedente" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface">
        ‹
      </Link>
      <p className="text-lg font-semibold">{etichettaGiorno(data)}</p>
      {nextDisabled ? (
        <span className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background text-muted opacity-40">
          ›
        </span>
      ) : (
        <Link href={href(next)} aria-label="Giorno successivo" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface">
          ›
        </Link>
      )}
    </div>
  );
}
