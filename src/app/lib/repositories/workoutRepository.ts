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
  const exercisesPayload = workout.exercises.map((exercise) => ({
    name: normalizeExerciseName(exercise.name),
    templateExerciseId: exercise.templateExerciseId ?? null,
    sets: exercise.sets.map((set) => ({
      weight: set.weight,
      reps: set.reps,
    })),
  }));

  const { data: workoutId, error } = await supabase.rpc("save_workout_atomic", {
    p_date: workout.date,
    p_template_id: workout.templateId ?? null,
    p_exercises: exercisesPayload,
  });

  if (error || !workoutId) {
    handleSupabaseError(error, "Failed to save workout.");
    // handleSupabaseError throws, but TypeScript doesn't know that
    throw new Error("Failed to save workout."); // Unreachable, but satisfies type checker
  }

  if (typeof workoutId !== "string") {
    throw new Error("Failed to save workout.");
  }

  return assertUUID(workoutId);
}
