-- Insert Full Body A workout template (only if it doesn't exist)
insert into public.workout_templates (name)
select 'Full Body A'
where not exists (
  select 1 from public.workout_templates where name = 'Full Body A'
);

-- Insert exercises for Full Body A template
-- Using a CTE to get the template ID
with full_body_template as (
  select id from public.workout_templates where name = 'Full Body A' limit 1
)
insert into public.workout_template_exercises (template_id, name, sort_order)
select 
  (select id from full_body_template),
  name,
  sort_order
from (values
  ('Dumbbell Squat', 1),
  ('Dumbbell Romanian Deadlift', 2),
  ('Bent-Over Dumbbell Row', 3),
  ('One-Arm Dumbbell Row (Bench Supported)', 4),
  ('Dumbbell Bench Press', 5),
  ('Dumbbell Chest Fly', 6),
  ('Dumbbell Lateral Raise', 7),
  ('Dumbbell Bicep Curl', 8),
  ('Overhead Dumbbell Triceps Extension (Standing)', 9)
) as exercises(name, sort_order)
where not exists (
  select 1 from public.workout_template_exercises wte
  join full_body_template fbt on wte.template_id = fbt.id
  where wte.name = exercises.name
);
