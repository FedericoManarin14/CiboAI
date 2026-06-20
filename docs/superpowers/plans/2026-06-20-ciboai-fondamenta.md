# CiboAI — Piano 1: Fondamenta Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Costruire le fondamenta di CiboAI — progetto Next.js PWA, Supabase con schema + RLS, autenticazione, profilo con calcolo fabbisogno (BMR/TDEE testato) — fino a un'app deployata su Vercel dove un utente fa login, compila il profilo e vede il proprio obiettivo calorico.

**Architecture:** Next.js App Router (TypeScript) come PWA mobile-first. Supabase per Auth + Postgres con Row Level Security. Logica nutrizionale in moduli puri testati con Vitest. Deploy su Vercel free. La chiave AI e le service key stanno solo lato server.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, Supabase (`@supabase/supabase-js`, `@supabase/ssr`), Vitest, Zod.

## Global Constraints

- Lingua UI: italiano. Unità: grammi/kg, kcal.
- Solo piani gratuiti: Vercel Hobby + Supabase Free.
- Chiave AI / service role key SOLO lato server (env var), mai nel bundle client.
- RLS attiva su ogni tabella: ogni utente accede solo alle righe col proprio `user_id`.
- Registrazione pubblica chiusa: solo l'admin crea account.
- Mobile-first sempre.
- Consulta Context7 MCP per la sintassi aggiornata di Next.js, Supabase SSR, Tailwind prima di usarli.
- Mifflin-St Jeor per il BMR. TDEE = BMR × moltiplicatore attività.

---

### Task 1: Scaffold progetto Next.js + Tailwind + Vitest

**Files:**
- Create: progetto Next.js in `./` (App Router, TypeScript, Tailwind)
- Create: `vitest.config.ts`
- Modify: `package.json` (script test)
- Create: `.env.local.example`

**Interfaces:**
- Consumes: niente (primo task)
- Produces: progetto eseguibile con `npm run dev` e `npm test`. Alias import `@/*` → root.

- [ ] **Step 1: Scaffold Next.js**

Run (non interattivo):
```bash
npx create-next-app@latest . --ts --tailwind --app --eslint --src-dir --import-alias "@/*" --no-turbopack --yes
```
Expected: progetto creato in `src/`, build ok.

- [ ] **Step 2: Installa dipendenze di test e runtime**

```bash
npm i @supabase/supabase-js @supabase/ssr zod
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Configura Vitest**

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', globals: true },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
```

- [ ] **Step 4: Aggiungi script test**

Modify `package.json` scripts: aggiungi `"test": "vitest run"` e `"test:watch": "vitest"`.

- [ ] **Step 5: Crea esempio env**

Create `.env.local.example`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_GENAI_API_KEY=
```

- [ ] **Step 6: Verifica build e test runner**

Run: `npm run build` → Expected: build ok.
Run: `npm test` → Expected: "No test files found" (esce 0 o avviso, ok).

- [ ] **Step 7: Commit**

```bash
git init && git add -A
git commit -m "chore: scaffold Next.js + Tailwind + Vitest"
```

---

### Task 2: Logica fabbisogno calorico (BMR/TDEE) — TDD

**Files:**
- Create: `src/lib/nutrition/energy.ts`
- Test: `src/lib/nutrition/energy.test.ts`

**Interfaces:**
- Consumes: niente
- Produces:
  - `type Sesso = 'uomo' | 'donna'`
  - `type LivelloAttivita = 'sedentario' | 'leggero' | 'moderato' | 'attivo' | 'molto_attivo'`
  - `type Obiettivo = 'dimagrire' | 'mantenere' | 'aumentare'`
  - `bmrMifflin(p: { sesso: Sesso; pesoKg: number; altezzaCm: number; eta: number }): number`
  - `tdee(bmr: number, livello: LivelloAttivita): number`
  - `kcalObiettivo(tdeeVal: number, obiettivo: Obiettivo): number`

- [ ] **Step 1: Write the failing test**

Create `src/lib/nutrition/energy.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { bmrMifflin, tdee, kcalObiettivo } from './energy';

describe('bmrMifflin', () => {
  it('uomo 80kg/180cm/30 = 1780', () => {
    expect(bmrMifflin({ sesso: 'uomo', pesoKg: 80, altezzaCm: 180, eta: 30 })).toBe(1780);
  });
  it('donna 60kg/165cm/30 = 1320.25', () => {
    expect(bmrMifflin({ sesso: 'donna', pesoKg: 60, altezzaCm: 165, eta: 30 })).toBeCloseTo(1320.25, 2);
  });
});

describe('tdee', () => {
  it('sedentario = bmr*1.2', () => {
    expect(tdee(1780, 'sedentario')).toBeCloseTo(2136, 0);
  });
  it('moderato = bmr*1.55', () => {
    expect(tdee(1780, 'moderato')).toBeCloseTo(2759, 0);
  });
});

describe('kcalObiettivo', () => {
  it('dimagrire sottrae 500', () => { expect(kcalObiettivo(2000, 'dimagrire')).toBe(1500); });
  it('mantenere invariato', () => { expect(kcalObiettivo(2000, 'mantenere')).toBe(2000); });
  it('aumentare aggiunge 400', () => { expect(kcalObiettivo(2000, 'aumentare')).toBe(2400); });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/lib/nutrition/energy.test.ts`
Expected: FAIL — modulo `./energy` non trovato.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/nutrition/energy.ts`:
```ts
export type Sesso = 'uomo' | 'donna';
export type LivelloAttivita = 'sedentario' | 'leggero' | 'moderato' | 'attivo' | 'molto_attivo';
export type Obiettivo = 'dimagrire' | 'mantenere' | 'aumentare';

export function bmrMifflin(p: { sesso: Sesso; pesoKg: number; altezzaCm: number; eta: number }): number {
  const base = 10 * p.pesoKg + 6.25 * p.altezzaCm - 5 * p.eta;
  return p.sesso === 'uomo' ? base + 5 : base - 161;
}

const MOLT: Record<LivelloAttivita, number> = {
  sedentario: 1.2, leggero: 1.375, moderato: 1.55, attivo: 1.725, molto_attivo: 1.9,
};

export function tdee(bmr: number, livello: LivelloAttivita): number {
  return bmr * MOLT[livello];
}

const OFFSET: Record<Obiettivo, number> = { dimagrire: -500, mantenere: 0, aumentare: 400 };

export function kcalObiettivo(tdeeVal: number, obiettivo: Obiettivo): number {
  return Math.round(tdeeVal) + OFFSET[obiettivo];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/lib/nutrition/energy.test.ts`
Expected: PASS (tutti i test verdi).

- [ ] **Step 5: Commit**

```bash
git add src/lib/nutrition
git commit -m "feat: calcolo BMR/TDEE/obiettivo calorico (Mifflin-St Jeor)"
```

---

### Task 3: Split macronutrienti dall'obiettivo kcal — TDD

**Files:**
- Create: `src/lib/nutrition/macros.ts`
- Test: `src/lib/nutrition/macros.test.ts`

**Interfaces:**
- Consumes: niente
- Produces:
  - `type MacroGrammi = { proteine_g: number; carboidrati_g: number; grassi_g: number }`
  - `splitMacro(kcal: number, ratio?: { p: number; c: number; g: number }): MacroGrammi`
  - Default ratio `{ p: 0.3, c: 0.4, g: 0.3 }`. Proteine/carbo 4 kcal/g, grassi 9 kcal/g.

- [ ] **Step 1: Write the failing test**

Create `src/lib/nutrition/macros.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { splitMacro } from './macros';

describe('splitMacro', () => {
  it('2000 kcal default 30/40/30', () => {
    const m = splitMacro(2000);
    expect(m.proteine_g).toBe(150);   // 600 kcal / 4
    expect(m.carboidrati_g).toBe(200); // 800 kcal / 4
    expect(m.grassi_g).toBe(67);       // 600 kcal / 9 arrotondato
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/lib/nutrition/macros.test.ts`
Expected: FAIL — modulo non trovato.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/nutrition/macros.ts`:
```ts
export type MacroGrammi = { proteine_g: number; carboidrati_g: number; grassi_g: number };

export function splitMacro(
  kcal: number,
  ratio: { p: number; c: number; g: number } = { p: 0.3, c: 0.4, g: 0.3 },
): MacroGrammi {
  return {
    proteine_g: Math.round((kcal * ratio.p) / 4),
    carboidrati_g: Math.round((kcal * ratio.c) / 4),
    grassi_g: Math.round((kcal * ratio.g) / 9),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/lib/nutrition/macros.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/nutrition/macros.ts src/lib/nutrition/macros.test.ts
git commit -m "feat: split macronutrienti da obiettivo kcal"
```

---

### Task 4: Progetto Supabase + schema + RLS

**Files:**
- Create: `supabase/migrations/0001_init.sql`

**Interfaces:**
- Consumes: niente
- Produces: tabelle `profiles`, `food_entries`, `weight_logs`, `exercise_logs` con RLS. Enum `tipo_pasto`, `obiettivo`, `livello_attivita`, `sesso`, `fonte`, `ruolo`.

- [ ] **Step 1: Crea il progetto Supabase**

Dashboard Supabase → New project (Free). Annota URL, anon key, service role key.
Popola `.env.local` (copia da `.env.local.example`) con i valori.

- [ ] **Step 2: Scrivi la migrazione SQL**

Create `supabase/migrations/0001_init.sql`:
```sql
-- enums
create type sesso as enum ('uomo','donna');
create type obiettivo as enum ('dimagrire','mantenere','aumentare');
create type livello_attivita as enum ('sedentario','leggero','moderato','attivo','molto_attivo');
create type tipo_pasto as enum ('colazione','pranzo','cena','spuntino');
create type fonte as enum ('foto','barcode','ricerca','manuale');
create type ruolo as enum ('admin','user');

-- profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  sesso sesso,
  eta int,
  altezza_cm int,
  peso_kg numeric,
  obiettivo obiettivo,
  livello_attivita livello_attivita,
  kcal_target int,
  proteine_target_g int,
  carbo_target_g int,
  grassi_target_g int,
  ruolo ruolo not null default 'user',
  created_at timestamptz not null default now()
);

-- food_entries
create table food_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data date not null,
  tipo_pasto tipo_pasto not null,
  nome text not null,
  grammi numeric not null,
  kcal numeric not null default 0,
  proteine_g numeric not null default 0,
  carboidrati_g numeric not null default 0,
  grassi_g numeric not null default 0,
  fibre_g numeric not null default 0,
  zuccheri_g numeric not null default 0,
  grassi_saturi_g numeric not null default 0,
  sodio_mg numeric not null default 0,
  potassio_mg numeric not null default 0,
  calcio_mg numeric not null default 0,
  ferro_mg numeric not null default 0,
  magnesio_mg numeric not null default 0,
  vit_a_ug numeric not null default 0,
  vit_c_mg numeric not null default 0,
  vit_d_ug numeric not null default 0,
  vit_b12_ug numeric not null default 0,
  fonte fonte not null default 'manuale',
  created_at timestamptz not null default now()
);
create index on food_entries (user_id, data);

-- weight_logs
create table weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data date not null,
  peso_kg numeric not null,
  created_at timestamptz not null default now()
);
create index on weight_logs (user_id, data);

-- exercise_logs
create table exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data date not null,
  attivita text not null,
  kcal_bruciate numeric not null default 0,
  created_at timestamptz not null default now()
);
create index on exercise_logs (user_id, data);

-- RLS
alter table profiles enable row level security;
alter table food_entries enable row level security;
alter table weight_logs enable row level security;
alter table exercise_logs enable row level security;

create policy "own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own food" on food_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own weight" on weight_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own exercise" on exercise_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- crea profilo automatico alla registrazione
create function handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id) values (new.id);
  return new;
end; $$;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();
```

- [ ] **Step 3: Applica la migrazione**

Esegui l'SQL nel SQL Editor di Supabase (o via `supabase db push` se usi la CLI).
Expected: 4 tabelle + policy create senza errori.

- [ ] **Step 4: Verifica RLS**

Nel SQL Editor: `select tablename, rowsecurity from pg_tables where schemaname='public';`
Expected: `rowsecurity = true` per tutte e 4 le tabelle.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0001_init.sql
git commit -m "feat: schema Supabase + RLS"
```

---

### Task 5: Client Supabase (browser + server) e tipi

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/types.ts`

**Interfaces:**
- Consumes: env `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Produces:
  - `createBrowserClient()` da `client.ts`
  - `createServerClient()` (async, legge i cookie) da `server.ts`
  - tipi `Profile`, `FoodEntry`, `WeightLog`, `ExerciseLog` da `types.ts`

> Consulta Context7 per l'API aggiornata di `@supabase/ssr` (gestione cookie in App Router).

- [ ] **Step 1: Tipi**

Create `src/lib/supabase/types.ts` con i tipi TS che rispecchiano le tabelle (campi del Task 4). Include `Profile`, `FoodEntry`, `WeightLog`, `ExerciseLog`.

- [ ] **Step 2: Client browser**

Create `src/lib/supabase/client.ts`:
```ts
import { createBrowserClient } from '@supabase/ssr';

export function createBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 3: Client server**

Create `src/lib/supabase/server.ts`:
```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => toSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)),
      },
    },
  );
}
```

- [ ] **Step 4: Verifica typecheck**

Run: `npm run build`
Expected: build ok (nessun errore di tipo). Se l'API `@supabase/ssr` differisce, allinea a quanto trovato su Context7.

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase
git commit -m "feat: client Supabase browser/server + tipi"
```

---

### Task 6: Login + middleware sessione

**Files:**
- Create: `src/middleware.ts`
- Create: `src/app/login/page.tsx`
- Create: `src/app/login/actions.ts`
- Create: `src/app/auth/signout/route.ts`

**Interfaces:**
- Consumes: `createServer()` (Task 5)
- Produces: utente non autenticato redirezionato a `/login`; server action `login(formData)`; route `/auth/signout`.

> Niente signup pubblico: solo form di login. Gli account si creano dal pannello Supabase (Task 8).

- [ ] **Step 1: Middleware che protegge le rotte**

Create `src/middleware.ts` che rinfresca la sessione e redirige a `/login` se non autenticato (escludi `/login`, asset, `/auth`). Usa `@supabase/ssr` come da Context7.

- [ ] **Step 2: Server action login**

Create `src/app/login/actions.ts`:
```ts
'use server';
import { redirect } from 'next/navigation';
import { createServer } from '@/lib/supabase/server';

export async function login(formData: FormData) {
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));
  const supabase = await createServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect('/login?error=1');
  redirect('/');
}
```

- [ ] **Step 3: Pagina login (mobile-first)**

Create `src/app/login/page.tsx`: form email/password che chiama l'action `login`. Stile Tailwind minimal, centrato, bianco. Mostra errore se `?error=1`.

- [ ] **Step 4: Signout**

Create `src/app/auth/signout/route.ts`: POST → `supabase.auth.signOut()` → redirect `/login`.

- [ ] **Step 5: Verifica manuale**

Run: `npm run dev`. Crea un utente di test dal dashboard Supabase (Authentication → Add user). Vai su `/` → redirect a `/login` → login → arrivi alla home. Logout funziona.
Expected: flusso completo ok.

- [ ] **Step 6: Commit**

```bash
git add src/middleware.ts src/app/login src/app/auth
git commit -m "feat: login email/password + protezione rotte"
```

---

### Task 7: Onboarding profilo + salvataggio obiettivi

**Files:**
- Create: `src/app/profilo/page.tsx`
- Create: `src/app/profilo/actions.ts`
- Create: `src/lib/nutrition/profile.ts`
- Test: `src/lib/nutrition/profile.test.ts`

**Interfaces:**
- Consumes: `bmrMifflin`, `tdee`, `kcalObiettivo` (Task 2), `splitMacro` (Task 3), `createServer()` (Task 5)
- Produces:
  - `calcolaTargets(p): { kcal_target; proteine_target_g; carbo_target_g; grassi_target_g }`
  - server action `salvaProfilo(formData)`

- [ ] **Step 1: Write the failing test**

Create `src/lib/nutrition/profile.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { calcolaTargets } from './profile';

describe('calcolaTargets', () => {
  it('uomo 80/180/30 moderato mantenere', () => {
    const t = calcolaTargets({
      sesso: 'uomo', pesoKg: 80, altezzaCm: 180, eta: 30,
      livello: 'moderato', obiettivo: 'mantenere',
    });
    expect(t.kcal_target).toBe(2759); // round(1780*1.55)
    expect(t.proteine_target_g).toBe(207);
    expect(t.carbo_target_g).toBe(276);
    expect(t.grassi_target_g).toBe(92);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/lib/nutrition/profile.test.ts`
Expected: FAIL — modulo non trovato.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/nutrition/profile.ts`:
```ts
import { bmrMifflin, tdee, kcalObiettivo, type Sesso, type LivelloAttivita, type Obiettivo } from './energy';
import { splitMacro } from './macros';

export function calcolaTargets(p: {
  sesso: Sesso; pesoKg: number; altezzaCm: number; eta: number;
  livello: LivelloAttivita; obiettivo: Obiettivo;
}) {
  const bmr = bmrMifflin({ sesso: p.sesso, pesoKg: p.pesoKg, altezzaCm: p.altezzaCm, eta: p.eta });
  const kcal = kcalObiettivo(tdee(bmr, p.livello), p.obiettivo);
  const m = splitMacro(kcal);
  return {
    kcal_target: kcal,
    proteine_target_g: m.proteine_g,
    carbo_target_g: m.carboidrati_g,
    grassi_target_g: m.grassi_g,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/lib/nutrition/profile.test.ts`
Expected: PASS.

- [ ] **Step 5: Server action salvaProfilo**

Create `src/app/profilo/actions.ts`: legge i campi dal form, valida con Zod, chiama `calcolaTargets`, fa `upsert` su `profiles` con `createServer()`. Redirect a `/`.

- [ ] **Step 6: Pagina profilo**

Create `src/app/profilo/page.tsx`: form (sesso, età, altezza, peso, obiettivo, livello attività) precompilato dai dati esistenti, mobile-first. Sotto, mostra l'obiettivo kcal + macro calcolati.

- [ ] **Step 7: Verifica manuale**

Run: `npm run dev` → login → `/profilo` → compila e salva → ricarica → valori persistiti e target mostrati.
Expected: profilo salvato, obiettivo visibile.

- [ ] **Step 8: Commit**

```bash
git add src/app/profilo src/lib/nutrition/profile.ts src/lib/nutrition/profile.test.ts
git commit -m "feat: onboarding profilo + calcolo obiettivi"
```

---

### Task 8: Home con obiettivo + PWA + admin crea utenti + deploy

**Files:**
- Create: `src/app/page.tsx`
- Create: `public/manifest.json`
- Create: `public/icon-192.png`, `public/icon-512.png`
- Modify: `src/app/layout.tsx` (link manifest, lang it, viewport)
- Create: `docs/admin-creazione-utenti.md`

**Interfaces:**
- Consumes: `createServer()` (Task 5), tabella `profiles`
- Produces: app deployata e installabile; procedura per creare account amici.

- [ ] **Step 1: Home**

Create `src/app/page.tsx` (Server Component): legge il profilo dell'utente loggato. Se mancano i target → invito a completare `/profilo`. Altrimenti mostra anello/numero obiettivo kcal e i macro target. Link a `/profilo` e bottone logout.

- [ ] **Step 2: Manifest PWA**

Create `public/manifest.json`:
```json
{
  "name": "CiboAI",
  "short_name": "CiboAI",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#ffffff",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```
Aggiungi due icone PNG (192 e 512). Collega il manifest e imposta `lang="it"` + viewport in `layout.tsx`.

- [ ] **Step 3: Doc creazione utenti (admin)**

Create `docs/admin-creazione-utenti.md`: spiega che gli account si creano da Supabase → Authentication → Add user (email + password), e che il trigger crea il profilo. Registrazione pubblica resta chiusa.

- [ ] **Step 4: Verifica build + test completi**

Run: `npm run build` → Expected: ok.
Run: `npm test` → Expected: tutti i test verdi.

- [ ] **Step 5: Deploy su Vercel**

Collega il repo a Vercel. Imposta le env var (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_GENAI_API_KEY` placeholder) su Vercel. Deploy.
Expected: URL pubblico raggiungibile, login funziona, profilo persiste.

- [ ] **Step 6: Verifica PWA da telefono**

Apri l'URL dal telefono → "Aggiungi a schermata Home" → l'app si apre standalone.
Expected: installabile e usabile.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: home obiettivo + PWA + doc admin; deploy Vercel"
```

---

## Self-Review (esito)

- **Copertura spec (Piano 1):** scaffold (T1), calcoli BMR/TDEE/macro testati (T2,T3,T7), schema+RLS (T4), client Supabase (T5), auth senza signup pubblico (T6), profilo/fabbisogno (T7), home+PWA+admin+deploy (T8). ✅
- **Placeholder:** ogni step ha codice o comando reale. ✅
- **Coerenza tipi:** `Sesso/LivelloAttivita/Obiettivo` definiti in T2 e riusati in T7; `calcolaTargets` usa `kcalObiettivo` + `splitMacro` come da firme. ✅

Fuori da questo piano (diario, foto AI, barcode, storico, attività): coperti dai Piani 2–9 sotto, da dettagliare quando ci si arriva.

---

## Piani successivi (scope, da dettagliare uno alla volta)

Ognuno produce software funzionante e testabile, e avrà il suo file in `docs/superpowers/plans/`.

- **Piano 2 — Diario giornaliero + inserimento manuale:** vista giorno con 4 pasti, CRUD `food_entries`, somma totali e confronto con gli obiettivi (anelli/barre), navigazione tra i giorni.
- **Piano 3 — Flusso foto AI (cuore):** API route server → Gemini 2.5 Flash con prompt JSON strutturato, validazione Zod, retry+fallback, schermata di revisione modificabile, salvataggio nel pasto. Foto scartata.
- **Piano 4 — Barcode + ricerca:** integrazione Open Food Facts (scansione codice a barre + ricerca per nome), mapping ai campi nutrienti, quantità → `food_entry`.
- **Piano 5 — Storico e grafici:** calendario/storico giorni, log peso, grafici peso e kcal nel tempo (Recharts).
- **Piano 6 — Attività fisica:** `exercise_logs`, elenco attività comuni, kcal bruciate aggiunte al budget del giorno.
- **Piano 7 — Rifinitura:** UI minimal definitiva, gestione errori, stati vuoti, accessibilità mobile, ottimizzazione costi AI (monitoraggio uso).
