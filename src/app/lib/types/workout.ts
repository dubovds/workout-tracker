/**
 * Common workout-related types
 * Centralized type definitions to avoid duplication
 */

import type { UUID } from "./common";

/**
 * Base set data structure.
 * `done` is the UI-only "set completed" flag (alias for isCompleted); not saved to DB.
 */
export type SetData = {
  id?: string; // Optional for payload
  weight: number;
  reps: number;
  /** UI-only: set completed = locked; not persisted */
  done?: boolean;
};

/**
 * Base exercise data structure
 */
export type ExerciseData = {
  id?: string; // Optional for payload
  name: string;
  sets: ReadonlyArray<SetData>;
};

/**
 * Set entry for components (always has id)
 */
export type SetEntry = SetData & { id: string };

/**
 * Exercise entry for components (always has id and typed sets)
 */
export type ExerciseEntry = ExerciseData & {
  id: string;
  sets: ReadonlyArray<SetEntry>;
};

/**
 * Set payload for repository (no id)
 */
export type SetPayload = Omit<SetData, "id">;

/**
 * Exercise payload for repository (no id, includes template reference)
 */
export type ExercisePayload = Omit<ExerciseData, "id"> & {
  templateExerciseId?: UUID;
};
