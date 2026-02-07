create or replace function public.save_workout_atomic(
  p_date date,
  p_template_id uuid default null,
  p_exercises jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_workout_id uuid;
  v_exercise jsonb;
  v_set jsonb;
  v_exercise_id uuid;
begin
  if jsonb_typeof(p_exercises) <> 'array' then
    raise exception 'p_exercises must be a JSON array';
  end if;

  insert into public.workouts (date, template_id)
  values (p_date, p_template_id)
  returning id into v_workout_id;

  for v_exercise in
    select value from jsonb_array_elements(p_exercises)
  loop
    if jsonb_typeof(v_exercise -> 'sets') <> 'array' then
      raise exception 'exercise sets must be a JSON array';
    end if;

    if jsonb_array_length(v_exercise -> 'sets') = 0 then
      continue;
    end if;

    insert into public.exercises (workout_id, template_exercise_id, name)
    values (
      v_workout_id,
      nullif(v_exercise ->> 'templateExerciseId', '')::uuid,
      trim(regexp_replace(coalesce(v_exercise ->> 'name', ''), '\s+', ' ', 'g'))
    )
    returning id into v_exercise_id;

    for v_set in
      select value from jsonb_array_elements(v_exercise -> 'sets')
    loop
      insert into public.sets (exercise_id, weight, reps)
      values (
        v_exercise_id,
        (v_set ->> 'weight')::numeric,
        (v_set ->> 'reps')::integer
      );
    end loop;
  end loop;

  return v_workout_id;
end;
$$;
