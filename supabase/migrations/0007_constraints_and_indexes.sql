do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'workout_templates_name_length_check'
  ) then
    alter table public.workout_templates
      add constraint workout_templates_name_length_check
      check (char_length(trim(name)) between 1 and 100);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'workout_template_exercises_name_length_check'
  ) then
    alter table public.workout_template_exercises
      add constraint workout_template_exercises_name_length_check
      check (char_length(trim(name)) between 1 and 100);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'exercises_name_length_check'
  ) then
    alter table public.exercises
      add constraint exercises_name_length_check
      check (char_length(trim(name)) between 1 and 100);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'sets_weight_range_check'
  ) then
    alter table public.sets
      add constraint sets_weight_range_check
      check (weight >= 0 and weight <= 10000);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'sets_reps_range_check'
  ) then
    alter table public.sets
      add constraint sets_reps_range_check
      check (reps >= 1 and reps <= 1000);
  end if;
end $$;

create index if not exists idx_exercises_workout_id
  on public.exercises(workout_id);

create index if not exists idx_sets_exercise_id
  on public.sets(exercise_id);

create index if not exists idx_workouts_date
  on public.workouts(date desc);

create index if not exists idx_exercises_normalized_name
  on public.exercises ((lower(trim(regexp_replace(name, '\s+', ' ', 'g')))));
