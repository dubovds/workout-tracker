import { supabase } from "./supabase";

export type WorkoutPayload = {
  date: string;
  exercises: {
    name: string;
    sets: {
      weight: number;
      reps: number;
    }[];
  }[];
};

export async function saveWorkout(workout: WorkoutPayload) {
  const { data: workoutRow, error: workoutError } = await supabase
    .from("workouts")
    .insert({ date: workout.date })
    .select("id")
    .single();

  if (workoutError || !workoutRow) {
    throw new Error(
      workoutError?.message ?? "Failed to create workout."
    );
  }

  for (const exercise of workout.exercises) {
    const { data: exerciseRow, error: exerciseError } = await supabase
      .from("exercises")
      .insert({
        workout_id: workoutRow.id,
          name: exercise.name.trim().replace(/\s+/g, " "),
      })
      .select("id")
      .single();

    if (exerciseError || !exerciseRow) {
      throw new Error(
        exerciseError?.message ??
          `Failed to create exercise: ${exercise.name}.`
      );
    }

    if (exercise.sets.length === 0) {
      continue;
    }

    const { error: setsError } = await supabase.from("sets").insert(
      exercise.sets.map((set) => ({
        exercise_id: exerciseRow.id,
        weight: set.weight,
        reps: set.reps,
      }))
    );

    if (setsError) {
      throw new Error(
        setsError.message ??
          `Failed to create sets for exercise: ${exercise.name}.`
      );
    }
  }

  return workoutRow.id;
}
