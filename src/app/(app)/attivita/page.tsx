import Link from 'next/link';
import { getProfile } from '@/lib/supabase/queries';
import { dataValidaOggi, etichettaGiorno } from '@/lib/date';
import { AttivitaForm } from './AttivitaForm';

export const metadata = { title: 'Attività — CiboAI' };

export default async function AttivitaPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const { data: dataParam } = await searchParams;
  const data = dataValidaOggi(dataParam);
  const profile = await getProfile();

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <Link href={`/?d=${data}`} aria-label="Indietro" className="text-2xl leading-none text-muted">
          ‹
        </Link>
        <div>
          <h1 className="text-xl font-bold">Attività fisica</h1>
          <p className="text-sm text-muted">{etichettaGiorno(data)}</p>
        </div>
      </header>

      <AttivitaForm data={data} pesoKg={Number(profile?.peso_kg ?? 70)} />
    </div>
  );
}
