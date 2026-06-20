import Link from 'next/link';
import { dataValidaOggi } from '@/lib/date';
import { TIPI_PASTO, type TipoPasto } from '@/lib/supabase/types';
import { ManualeForm } from './ManualeForm';

export const metadata = { title: 'Inserimento manuale — CiboAI' };

export default async function ManualePage({
  searchParams,
}: {
  searchParams: Promise<{ pasto?: string; data?: string }>;
}) {
  const { pasto, data: dataParam } = await searchParams;
  const data = dataValidaOggi(dataParam);
  const pastoSel = (TIPI_PASTO.includes(pasto as TipoPasto) ? pasto : 'pranzo') as TipoPasto;

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <Link href={`/aggiungi?pasto=${pastoSel}&data=${data}`} aria-label="Indietro" className="text-2xl leading-none text-muted">
          ‹
        </Link>
        <h1 className="text-xl font-bold">Inserimento manuale</h1>
      </header>
      <ManualeForm data={data} pasto={pastoSel} />
    </div>
  );
}
