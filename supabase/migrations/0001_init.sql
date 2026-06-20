-- CiboAI — schema iniziale + Row Level Security
-- Tabelle: profiles, food_entries, weight_logs, exercise_logs

-- ===== enums =====
create type sesso as enum ('uomo','donna');
create type obiettivo as enum ('dimagrire','mantenere','aumentare');
create type livello_attivita as enum ('sedentario','leggero','moderato','attivo','molto_attivo');
create type tipo_pasto as enum ('colazione','pranzo','cena','spuntino');
create type fonte as enum ('foto','barcode','ricerca','manuale');
create type ruolo as enum ('admin','user');

-- ===== profiles (1:1 con auth.users) =====
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

-- ===== food_entries =====
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
create index food_entries_user_data_idx on food_entries (user_id, data);

-- ===== weight_logs (un peso per giorno) =====
create table weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data date not null,
  peso_kg numeric not null,
  created_at timestamptz not null default now(),
  unique (user_id, data)
);
create index weight_logs_user_data_idx on weight_logs (user_id, data);

-- ===== exercise_logs =====
create table exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data date not null,
  attivita text not null,
  kcal_bruciate numeric not null default 0,
  created_at timestamptz not null default now()
);
create index exercise_logs_user_data_idx on exercise_logs (user_id, data);

-- ===== Row Level Security =====
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

-- ===== crea profilo automatico alla registrazione =====
create function handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();
