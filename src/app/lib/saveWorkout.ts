import { supabase } from "./supabase";
import { normalizeExerciseName } from "./utils";

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
    .insert({ date: workout.date } as any)
    .select("id")
    .single();

  if (workoutError || !workoutRow) {
    throw new Error(
      workoutError?.message ?? "Failed to create workout."
    );
  }

  const workoutRowTyped = workoutRow as { id: string };
  const workoutId = workoutRowTyped.id;

  const exercisesWithSets = workout.exercises.filter(
    (exercise) => exercise.sets.length > 0
  );

  if (exercisesWithSets.length === 0) {
    return workoutId;
  }

  const exercisesToInsert = exercisesWithSets.map((exercise) => ({
    workout_id: workoutId,
    name: normalizeExerciseName(exercise.name),
  }));

  const { data: exerciseRows, error: exercisesError } = await supabase
    .from("exercises")
    .insert(exercisesToInsert as any)
    .select("id");

  if (exercisesError || !exerciseRows) {
    throw new Error(
      exercisesError?.message ?? "Failed to create exercises."
    );
  }

  const exerciseRowsTyped = exerciseRows as Array<{ id: string }>;

  const setsToInsert = exercisesWithSets.flatMap((exercise, index) => {
    const exerciseId = exerciseRowsTyped[index].id;
    return exercise.sets.map((set) => ({
      exercise_id: exerciseId,
      weight: set.weight,
      reps: set.reps,
    }));
  });

  if (setsToInsert.length > 0) {
    const { error: setsError } = await supabase
      .from("sets")
      .insert(setsToInsert as any);

    if (setsError) {
      throw new Error(
        setsError.message ?? "Failed to create sets."
      );
    }
  }

  return workoutId;
}
