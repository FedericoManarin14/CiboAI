import { getProfile } from '@/lib/supabase/queries';
import { hasTargets } from '@/lib/supabase/types';
import { salvaProfilo } from './actions';

export const metadata = { title: 'Profilo — CiboAI' };

const ATTIVITA: { value: string; label: string }[] = [
  { value: 'sedentario', label: 'Sedentario — poco o niente sport' },
  { value: 'leggero', label: 'Leggero — 1-3 giorni/settimana' },
  { value: 'moderato', label: 'Moderato — 3-5 giorni/settimana' },
  { value: 'attivo', label: 'Attivo — 6-7 giorni/settimana' },
  { value: 'molto_attivo', label: 'Molto attivo — lavoro fisico o 2x/giorno' },
];

const OBIETTIVI: { value: string; label: string }[] = [
  { value: 'dimagrire', label: 'Dimagrire (−500 kcal)' },
  { value: 'mantenere', label: 'Mantenere il peso' },
  { value: 'aumentare', label: 'Aumentare (+400 kcal)' },
];

export default async function ProfiloPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const profile = await getProfile();

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Profilo</h1>
        <form action="/auth/signout" method="post">
          <button className="text-sm font-medium text-muted underline-offset-2 hover:underline">
            Esci
          </button>
        </form>
      </header>

      {hasTargets(profile) && (
        <section className="card p-5">
          <p className="text-sm text-muted">Il tuo obiettivo giornaliero</p>
          <p className="mt-1 text-3xl font-bold">
            {profile.kcal_target} <span className="text-base font-medium text-muted">kcal</span>
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Target color="var(--proteine)" label="Proteine" value={profile.proteine_target_g} />
            <Target color="var(--carboidrati)" label="Carbo" value={profile.carbo_target_g} />
            <Target color="var(--grassi)" label="Grassi" value={profile.grassi_target_g} />
          </div>
        </section>
      )}

      {ok && (
        <p className="rounded-xl bg-brand/10 px-4 py-3 text-sm font-medium text-brand-600">
          Profilo salvato. Obiettivo aggiornato.
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-proteine/10 px-4 py-3 text-sm font-medium text-proteine">
          Controlla i campi inseriti.
        </p>
      )}

      <form action={salvaProfilo} className="card p-5 space-y-4">
        <h2 className="font-semibold">I tuoi dati</h2>

        <Field label="Sesso">
          <select name="sesso" defaultValue={profile?.sesso ?? ''} required className="input">
            <option value="" disabled>
              Seleziona…
            </option>
            <option value="uomo">Uomo</option>
            <option value="donna">Donna</option>
          </select>
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Età">
            <input name="eta" type="number" inputMode="numeric" min={10} max={120} defaultValue={profile?.eta ?? ''} required className="input" />
          </Field>
          <Field label="Altezza (cm)">
            <input name="altezza_cm" type="number" inputMode="numeric" min={100} max={250} defaultValue={profile?.altezza_cm ?? ''} required className="input" />
          </Field>
          <Field label="Peso (kg)">
            <input name="peso_kg" type="number" inputMode="decimal" step="0.1" min={30} max={400} defaultValue={profile?.peso_kg ?? ''} required className="input" />
          </Field>
        </div>

        <Field label="Obiettivo">
          <select name="obiettivo" defaultValue={profile?.obiettivo ?? ''} required className="input">
            <option value="" disabled>
              Seleziona…
            </option>
            {OBIETTIVI.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Livello di attività">
          <select name="livello_attivita" defaultValue={profile?.livello_attivita ?? ''} required className="input">
            <option value="" disabled>
              Seleziona…
            </option>
            {ATTIVITA.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </Field>

        <button type="submit" className="btn-primary w-full">
          Salva e calcola obiettivo
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

function Target({ color, label, value }: { color: string; label: string; value: number | null }) {
  return (
    <div className="rounded-xl bg-background py-2">
      <p className="text-lg font-bold tabular-nums" style={{ color }}>
        {value ?? 0}g
      </p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
