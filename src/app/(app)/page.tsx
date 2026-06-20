import Link from 'next/link';
import { getProfile, getFoodEntries, getExerciseLogs } from '@/lib/supabase/queries';
import { hasTargets, TIPI_PASTO, LABEL_PASTO } from '@/lib/supabase/types';
import { sumNutrients } from '@/lib/nutrition/totals';
import { dataValidaOggi } from '@/lib/date';
import { ProgressRing } from '@/components/ProgressRing';
import { MacroBars } from '@/components/MacroBars';
import { MicroPanel } from '@/components/MicroPanel';
import { DayNav } from '@/components/DayNav';
import { FoodEntryRow } from '@/components/FoodEntryRow';
import { EsercizioRow } from '@/components/EsercizioRow';

export default async function DiarioPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const { d } = await searchParams;
  const data = dataValidaOggi(d);

  const [profile, entries, exercises] = await Promise.all([
    getProfile(),
    getFoodEntries(data),
    getExerciseLogs(data),
  ]);

  const totals = sumNutrients(entries);
  const kcalBruciate = exercises.reduce((s, e) => s + Number(e.kcal_bruciate), 0);

  if (!hasTargets(profile)) {
    return (
      <div className="space-y-5">
        <DayNav data={data} />
        <section className="card p-6 text-center">
          <p className="text-4xl">🥗</p>
          <h2 className="mt-3 text-lg font-semibold">Benvenuto in CiboAI</h2>
          <p className="mt-1 text-sm text-muted">
            Completa il profilo per calcolare il tuo obiettivo calorico giornaliero.
          </p>
          <Link href="/profilo" className="btn-primary mt-4 w-full">
            Completa il profilo
          </Link>
        </section>
      </div>
    );
  }

  const budget = (profile.kcal_target ?? 0) + kcalBruciate;
  const consumate = Math.round(totals.kcal);
  const rimanenti = budget - consumate;

  return (
    <div className="space-y-5">
      <DayNav data={data} />

      {/* Riepilogo */}
      <section className="card p-5">
        <div className="flex flex-col items-center">
          <ProgressRing value={consumate} max={budget}>
            <div>
              <p className="text-3xl font-bold tabular-nums">{Math.abs(rimanenti)}</p>
              <p className="text-xs text-muted">{rimanenti >= 0 ? 'rimanenti' : 'oltre'}</p>
            </div>
          </ProgressRing>
          <div className="mt-3 flex gap-6 text-center text-sm">
            <div>
              <p className="font-semibold tabular-nums">{consumate}</p>
              <p className="text-xs text-muted">consumate</p>
            </div>
            <div>
              <p className="font-semibold tabular-nums">{profile.kcal_target}</p>
              <p className="text-xs text-muted">obiettivo</p>
            </div>
            <div>
              <p className="font-semibold tabular-nums">{Math.round(kcalBruciate)}</p>
              <p className="text-xs text-muted">attività</p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <MacroBars
            proteine={totals.proteine_g}
            carboidrati={totals.carboidrati_g}
            grassi={totals.grassi_g}
            targets={{
              proteine: profile.proteine_target_g ?? 0,
              carboidrati: profile.carbo_target_g ?? 0,
              grassi: profile.grassi_target_g ?? 0,
            }}
          />
        </div>

        <div className="mt-4">
          <MicroPanel totals={totals} />
        </div>
      </section>

      {/* Pasti */}
      {TIPI_PASTO.map((pasto) => {
        const items = entries.filter((e) => e.tipo_pasto === pasto);
        const sub = Math.round(items.reduce((s, e) => s + Number(e.kcal), 0));
        return (
          <section key={pasto} className="card p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{LABEL_PASTO[pasto]}</h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted tabular-nums">{sub} kcal</span>
                <Link
                  href={`/aggiungi?pasto=${pasto}&data=${data}`}
                  aria-label={`Aggiungi a ${LABEL_PASTO[pasto]}`}
                  className="grid h-8 w-8 place-items-center rounded-full bg-brand/10 text-brand-600 text-xl leading-none"
                >
                  +
                </Link>
              </div>
            </div>
            {items.length > 0 && (
              <ul className="mt-2">
                {items.map((e) => (
                  <FoodEntryRow key={e.id} entry={e} />
                ))}
              </ul>
            )}
          </section>
        );
      })}

      {/* Attività */}
      <section className="card p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Attività fisica</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-brand-600 tabular-nums">+{Math.round(kcalBruciate)} kcal</span>
            <Link
              href={`/attivita?data=${data}`}
              aria-label="Aggiungi attività"
              className="grid h-8 w-8 place-items-center rounded-full bg-brand/10 text-brand-600 text-xl leading-none"
            >
              +
            </Link>
          </div>
        </div>
        {exercises.length > 0 && (
          <ul className="mt-2">
            {exercises.map((e) => (
              <EsercizioRow key={e.id} log={e} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
