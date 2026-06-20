import Link from 'next/link';
import { getProfile, getWeightLogs, getDailyKcal } from '@/lib/supabase/queries';
import { addDays, oggiISO, etichettaGiorno } from '@/lib/date';
import { PesoChart, type PuntoPeso } from '@/components/PesoChart';
import { KcalChart, type PuntoKcal } from '@/components/KcalChart';
import { aggiungiPeso } from './actions';

export const metadata = { title: 'Storico — CiboAI' };

const GIORNI = 14;

function etichettaBreve(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${Number(d)}/${Number(m)}`;
}

export default async function StoricoPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const oggi = oggiISO();
  const da = addDays(oggi, -(GIORNI - 1));

  const [profile, pesi, kcalRows] = await Promise.all([
    getProfile(),
    getWeightLogs(90),
    getDailyKcal(da, oggi),
  ]);

  // Serie kcal ultimi GIORNI giorni
  const kcalPerGiorno = new Map<string, number>();
  for (const r of kcalRows) {
    kcalPerGiorno.set(r.data, (kcalPerGiorno.get(r.data) ?? 0) + Number(r.kcal));
  }
  const serieKcal: PuntoKcal[] = [];
  for (let i = 0; i < GIORNI; i++) {
    const iso = addDays(da, i);
    serieKcal.push({ etichetta: etichettaBreve(iso), kcal: Math.round(kcalPerGiorno.get(iso) ?? 0) });
  }

  const seriePeso: PuntoPeso[] = pesi.map((p) => ({
    etichetta: etichettaBreve(p.data),
    peso: Number(p.peso_kg),
  }));

  // Ultimi 7 giorni con riepilogo per la lista
  const giorniRecenti = Array.from({ length: 7 }, (_, i) => addDays(oggi, -i));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Storico</h1>

      {/* Peso */}
      <section className="card p-5">
        <h2 className="mb-2 font-semibold">Peso</h2>
        <PesoChart dati={seriePeso} />

        <form action={aggiungiPeso} className="mt-3 flex items-end gap-2">
          <label className="flex-1">
            <span className="label">Registra peso di oggi (kg)</span>
            <input name="peso_kg" type="number" inputMode="decimal" step="0.1" min={30} max={400} required className="input" placeholder={pesi.at(-1) ? String(pesi.at(-1)!.peso_kg) : '70'} />
          </label>
          <button className="btn-primary">Salva</button>
        </form>
        {ok && <p className="mt-2 text-sm font-medium text-brand-600">Peso registrato.</p>}
        {error && <p className="mt-2 text-sm font-medium text-proteine">Valore non valido.</p>}
      </section>

      {/* Calorie */}
      <section className="card p-5">
        <h2 className="mb-2 font-semibold">Calorie · ultimi {GIORNI} giorni</h2>
        <KcalChart dati={serieKcal} target={profile?.kcal_target ?? null} />
        {profile?.kcal_target != null && (
          <p className="mt-1 text-xs text-muted">Linea tratteggiata: obiettivo {profile.kcal_target} kcal.</p>
        )}
      </section>

      {/* Giorni recenti */}
      <section className="card p-4">
        <h2 className="mb-1 font-semibold">Giorni recenti</h2>
        <ul>
          {giorniRecenti.map((iso) => {
            const kcal = Math.round(kcalPerGiorno.get(iso) ?? 0);
            return (
              <li key={iso} className="border-t border-border first:border-t-0">
                <Link href={`/?d=${iso}`} className="flex items-center justify-between py-3">
                  <span className="font-medium capitalize">{etichettaGiorno(iso)}</span>
                  <span className="text-sm text-muted tabular-nums">{kcal} kcal ›</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
