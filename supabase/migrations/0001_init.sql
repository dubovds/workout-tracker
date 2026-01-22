create extension if not exists "pgcrypto";

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  created_at timestamptz default now()
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists public.sets (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  weight numeric not null,
  reps integer not null,
  created_at timestamptz default now()
);

alter table public.workouts enable row level security;
alter table public.exercises enable row level security;
alter table public.sets enable row level security;

drop policy if exists "allow all" on public.workouts;
drop policy if exists "allow all" on public.exercises;
drop policy if exists "allow all" on public.sets;

create policy "allow all" on public.workouts
  for all
  using (true)
  with check (true);

create policy "allow all" on public.exercises
  for all
  using (true)
  with check (true);

create policy "allow all" on public.sets
  for all
  using (true)
  with check (true);
