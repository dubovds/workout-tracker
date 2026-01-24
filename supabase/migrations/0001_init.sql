create extension if not exists "pgcrypto";

create table if not exists public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists public.workout_template_exercises (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null
    references public.workout_templates(id)
    on delete cascade,
  name text not null,
  sort_order integer not null,
  created_at timestamptz default now()
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  template_id uuid
    references public.workout_templates(id)
    on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  template_exercise_id uuid
    references public.workout_template_exercises(id)
    on delete set null,
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

alter table public.workout_templates enable row level security;
alter table public.workout_template_exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.exercises enable row level security;
alter table public.sets enable row level security;

drop policy if exists "allow all" on public.workout_templates;
drop policy if exists "allow all" on public.workout_template_exercises;
drop policy if exists "allow all" on public.workouts;
drop policy if exists "allow all" on public.exercises;
drop policy if exists "allow all" on public.sets;

create policy "allow all" on public.workout_templates
  for all
  using (true)
  with check (true);

create policy "allow all" on public.workout_template_exercises
  for all
  using (true)
  with check (true);

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

-- Create indexes for better query performance
create index if not exists idx_workout_template_exercises_template_id 
  on public.workout_template_exercises(template_id);

create index if not exists idx_workout_template_exercises_sort_order 
  on public.workout_template_exercises(template_id, sort_order);

create index if not exists idx_workouts_template_id 
  on public.workouts(template_id);

create index if not exists idx_exercises_template_exercise_id 
  on public.exercises(template_exercise_id);
