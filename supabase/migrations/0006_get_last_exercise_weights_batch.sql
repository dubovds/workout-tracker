create or replace function public.get_last_exercise_weights_batch(
  p_exercise_names text[]
)
returns table (
  exercise_name text,
  working_weight numeric,
  max_weight numeric,
  last_reps integer
)
language sql
security invoker
set search_path = public
as $$
with normalized_input as (
  select distinct lower(trim(regexp_replace(name, '\s+', ' ', 'g'))) as name
  from unnest(coalesce(p_exercise_names, array[]::text[])) as name
  where name is not null and btrim(name) <> ''
),
ranked_exercises as (
  select
    ni.name as normalized_name,
    e.id as exercise_id,
    row_number() over (
      partition by ni.name
      order by e.created_at desc, e.id desc
    ) as rn
  from normalized_input ni
  join public.exercises e
    on lower(trim(regexp_replace(e.name, '\s+', ' ', 'g'))) = ni.name
),
latest_exercises as (
  select normalized_name, exercise_id
  from ranked_exercises
  where rn = 1
),
latest_sets as (
  select
    le.normalized_name,
    s.weight,
    s.reps,
    row_number() over (
      partition by le.normalized_name
      order by s.created_at desc, s.id desc
    ) as set_rn
  from latest_exercises le
  join public.sets s on s.exercise_id = le.exercise_id
),
weight_frequency as (
  select
    normalized_name,
    weight,
    count(*) as freq
  from latest_sets
  group by normalized_name, weight
),
working_weights as (
  select distinct on (normalized_name)
    normalized_name,
    weight as working_weight
  from weight_frequency
  order by normalized_name, freq desc, weight desc
),
max_weights as (
  select
    normalized_name,
    max(weight) as max_weight
  from latest_sets
  group by normalized_name
),
last_reps_by_name as (
  select
    normalized_name,
    reps as last_reps
  from latest_sets
  where set_rn = 1
)
select
  ni.name as exercise_name,
  ww.working_weight,
  mw.max_weight,
  lr.last_reps
from normalized_input ni
left join working_weights ww on ww.normalized_name = ni.name
left join max_weights mw on mw.normalized_name = ni.name
left join last_reps_by_name lr on lr.normalized_name = ni.name;
$$;
