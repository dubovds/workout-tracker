/**
 * Application constants
 * Centralized configuration values to avoid magic numbers
 */

export const WORKOUT_CONSTANTS = {
  TOAST_DURATION_MS: 3500,
  MAX_EXERCISES: 100,
  MAX_SETS_PER_EXERCISE: 50,
  MAX_REPS: 1000,
  MAX_WEIGHT_KG: 10000,
  EXERCISE_NAME_MAX_LENGTH: 100,
  SAVE_COOLDOWN_MS: 2000,
} as const;
