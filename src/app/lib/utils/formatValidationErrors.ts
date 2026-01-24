import type { WorkoutValidationError } from "../services/workoutService";

/**
 * Formats validation errors into a user-friendly message
 * Centralized utility for consistent error formatting across the application
 */
export function formatValidationErrors(
  errors: WorkoutValidationError[]
): string {
  return errors
    .map(
      (error) =>
        `${error.exerciseName} — Set ${error.setIndex}: ${error.message}`
    )
    .join("\n");
}
