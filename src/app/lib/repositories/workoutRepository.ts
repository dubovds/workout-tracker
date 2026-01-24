import { getSupabaseClient } from "../supabase";
import { normalizeExerciseName } from "../utils";
import { handleSupabaseError } from "../utils/supabaseErrorHandler";
import type { UUID, DateString } from "../types/common";
import { assertUUID } from "../types/common";
import type { SetPayload, ExercisePayload } from "../types/workout";

// Re-export types for backward compatibility
export type { SetPayload, ExercisePayload };

export type WorkoutPayload = {
  date: DateString;
  templateId?: UUID;
  exercises: ExercisePayload[];
};

/**
 * Repository for workout data access
 * Only handles data persistence - validation is done in service layer
 */
export async function saveWorkout(workout: WorkoutPayload): Promise<UUID> {
  const supabase = getSupabaseClient();
  const { data: workoutRow, error: workoutError } = await supabase
    .from("workouts")
    .insert({
      date: workout.date,
      template_id: workout.templateId || null,
    })
    .select("id")
    .single();

  if (workoutError || !workoutRow) {
    handleSupabaseError(workoutError, "Failed to create workout.");
    // handleSupabaseError throws, but TypeScript doesn't know that
    throw new Error("Failed to create workout."); // Unreachable, but satisfies type checker
  }

  const workoutId = assertUUID(workoutRow.id);

  const exercisesWithSets = workout.exercises.filter(
    (exercise) => exercise.sets.length > 0
  );

  if (exercisesWithSets.length === 0) {
    return workoutId;
  }

  const exercisesToInsert = exercisesWithSets.map((exercise) => ({
    workout_id: workoutId,
    template_exercise_id: exercise.templateExerciseId || null,
    name: normalizeExerciseName(exercise.name),
  }));

  const { data: exerciseRows, error: exercisesError } = await supabase
    .from("exercises")
    .insert(exercisesToInsert)
    .select("id");

  if (exercisesError || !exerciseRows) {
    handleSupabaseError(exercisesError, "Failed to create exercises.");
    // handleSupabaseError throws, but TypeScript doesn't know that
    throw new Error("Failed to create exercises."); // Unreachable, but satisfies type checker
  }

  // Optimized: use for loop instead of flatMap to avoid intermediate arrays
  const setsToInsert: Array<{ exercise_id: UUID; weight: number; reps: number }> = [];
  for (let i = 0; i < exercisesWithSets.length; i++) {
    const exercise = exercisesWithSets[i];
    const exerciseRow = exerciseRows[i];
    if (!exerciseRow) {
      continue; // Skip if row is missing
    }
    const exerciseId = assertUUID(exerciseRow.id);
    for (const set of exercise.sets) {
      setsToInsert.push({
        exercise_id: exerciseId,
        weight: set.weight,
        reps: set.reps,
      });
    }
  }

  if (setsToInsert.length > 0) {
    const { error: setsError } = await supabase
      .from("sets")
      .insert(setsToInsert);

    if (setsError) {
      handleSupabaseError(setsError, "Failed to create sets.");
    }
  }

  return workoutId;
}
