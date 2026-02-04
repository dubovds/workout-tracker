-- Insert Full Body - Short workout template (only if it doesn't exist)
insert into public.workout_templates (name)
select 'Full Body - Short'
where not exists (
  select 1 from public.workout_templates where name = 'Full Body - Short'
);

-- Insert exercises for Full Body - Short template (reduced set for shorter session)
with short_template as (
  select id from public.workout_templates where name = 'Full Body - Short' limit 1
)
insert into public.workout_template_exercises (template_id, name, sort_order)
select
  (select id from short_template),
  name,
  sort_order
from (values
  ('Dumbbell Romanian Deadlift', 1),
  ('Bent-Over Dumbbell Row', 2),
  ('Dumbbell Bench Press', 3),
  ('Dumbbell Lateral Raise', 4),
  ('Dumbbell Ab Crunch', 5)
) as exercises(name, sort_order)
where not exists (
  select 1 from public.workout_template_exercises wte
  join short_template st on wte.template_id = st.id
  where wte.name = exercises.name
);
