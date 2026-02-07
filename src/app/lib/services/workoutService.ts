import { getWorkoutTemplates, getWorkoutTemplateExercises } from "../repositories/workoutTemplateRepository";
import { saveWorkout as saveWorkoutData, type WorkoutPayload } from "../repositories/workoutRepository";
import type { SelectOption } from "../../components/Select";
import type { ExerciseEntry } from "../types/workout";
import {
  isValidUUID,
  isValidArrayLength,
  isValidNumber,
} from "../utils/validation";
import type { UUID, DateString } from "../types/common";
import { assertUUID, assertDateString } from "../types/common";
import { WORKOUT_CONSTANTS } from "../constants";
import { formatValidationErrors as formatErrors } from "../utils/formatValidationErrors";

// Discriminated union for validation errors
export type WorkoutValidationError = {
  exerciseName: string;
  setIndex: number;
  field: "weight" | "reps";
  message: string;
};

export class WorkoutService {
  /**
   * Loads all workout templates and converts them to select options
   */
  async loadWorkoutTemplateOptions(): Promise<ReadonlyArray<SelectOption>> {
    const templates = await getWorkoutTemplates();
    return templates.map((template) => ({
      id: template.id,
      label: template.name,
    })) as ReadonlyArray<SelectOption>;
  }

  /**
   * Loads exercises for a template and converts them to ExerciseEntry format
   */
  async loadTemplateExercises(
    templateId: string
  ): Promise<{
    exercises: ReadonlyArray<ExerciseEntry>;
    templateExerciseMap: Map<string, string>;
  }> {
    // Validate templateId before querying
    if (!isValidUUID(templateId)) {
      throw new Error("Invalid template ID format.");
    }

    const templateExercises = await getWorkoutTemplateExercises(templateId);
    const exerciseMap = new Map<string, string>();
    const exerciseEntries: ReadonlyArray<ExerciseEntry> = templateExercises.map(
      (templateExercise) => {
        const exerciseId = `exercise-${templateExercise.id}`;
        exerciseMap.set(exerciseId, templateExercise.id);
        return {
          id: exerciseId,
          name: templateExercise.name,
          sets: [],
        } as const;
      }
    );

    return {
      exercises: exerciseEntries,
      templateExerciseMap: exerciseMap,
    };
  }

  /**
   * Validates exercise count
   */
  private validateExerciseCount(exercises: ExerciseEntry[]): WorkoutValidationError[] {
    if (!isValidArrayLength(exercises, 0, WORKOUT_CONSTANTS.MAX_EXERCISES)) {
      return [{
        exerciseName: "Workout",
        setIndex: 0,
        field: "weight",
        message: `Too many exercises in workout (max ${WORKOUT_CONSTANTS.MAX_EXERCISES})`,
      }];
    }
    return [];
  }

  /**
   * Validates exercise sets count
   */
  private validateExerciseSets(exercise: ExerciseEntry): WorkoutValidationError[] {
    // Convert readonly array to mutable for validation
    const setsArray = Array.from(exercise.sets);
    if (!isValidArrayLength(setsArray, 0, WORKOUT_CONSTANTS.MAX_SETS_PER_EXERCISE)) {
      return [{
        exerciseName: exercise.name,
        setIndex: 0,
        field: "weight",
        message: `Too many sets in exercise (max ${WORKOUT_CONSTANTS.MAX_SETS_PER_EXERCISE})`,
      }];
    }
    return [];
  }

  /**
   * Validates individual set data
   */
  private validateSet(
    set: ExerciseEntry["sets"][number],
    exerciseName: string,
    index: number
  ): WorkoutValidationError[] {
    const errors: WorkoutValidationError[] = [];

    if (!isValidNumber(set.reps, 1, WORKOUT_CONSTANTS.MAX_REPS)) {
      errors.push({
        exerciseName,
        setIndex: index + 1,
        field: "reps",
        message: `reps must be between 1 and ${WORKOUT_CONSTANTS.MAX_REPS}`,
      });
    }

    if (!isValidNumber(set.weight, 0, WORKOUT_CONSTANTS.MAX_WEIGHT_KG)) {
      errors.push({
        exerciseName,
        setIndex: index + 1,
        field: "weight",
        message: `weight must be between 0 and ${WORKOUT_CONSTANTS.MAX_WEIGHT_KG}`,
      });
    }

    return errors;
  }

  /**
   * Validates exercise name length
   */
  private validateExerciseName(exercise: ExerciseEntry): WorkoutValidationError[] {
    if (exercise.name.length > WORKOUT_CONSTANTS.EXERCISE_NAME_MAX_LENGTH) {
      return [{
        exerciseName: exercise.name,
        setIndex: 0,
        field: "weight",
        message: `Exercise name too long (max ${WORKOUT_CONSTANTS.EXERCISE_NAME_MAX_LENGTH} characters)`,
      }];
    }
    return [];
  }

  /**
   * Validates workout data before saving
   */
  validateWorkout(exercises: ExerciseEntry[]): WorkoutValidationError[] {
    const errors = this.validateExerciseCount(exercises);
    
    if (errors.length > 0) {
      return errors; // Early return if exercise count is invalid
    }

    for (const exercise of exercises) {
      errors.push(...this.validateExerciseName(exercise));
      errors.push(...this.validateExerciseSets(exercise));
      
      // Type-safe iteration over readonly array
      for (let index = 0; index < exercise.sets.length; index++) {
        const set = exercise.sets[index];
        errors.push(...this.validateSet(set, exercise.name, index));
      }
    }

    return errors;
  }

  /**
   * Formats validation errors into a user-friendly message
   * Delegates to centralized utility function
   */
  formatValidationErrors(errors: WorkoutValidationError[]): string {
    return formatErrors(errors);
  }

  /**
   * Validates UUIDs in workout payload
   */
  private validateWorkoutIds(
    templateId: string | null,
    templateExerciseMap: Map<string, string>
  ): void {
    if (templateId && !isValidUUID(templateId)) {
      throw new Error("Invalid template ID format.");
    }

    for (const [, templateExerciseId] of templateExerciseMap) {
      if (!isValidUUID(templateExerciseId)) {
        throw new Error("Invalid template exercise ID format.");
      }
    }
  }

  /**
   * Saves a workout with validation
   * @param date Optional date string (YYYY-MM-DD). If not provided, uses current date.
   */
  async saveWorkout(
    templateId: string | null,
    exercises: ExerciseEntry[],
    templateExerciseMap: Map<string, string>,
    date?: DateString
  ): Promise<UUID> {
    // Validate that workout has at least one exercise
    if (exercises.length === 0) {
      throw new Error("Cannot save workout: at least one exercise is required.");
    }

    // Validate that at least one exercise has sets
    const hasSets = exercises.some((exercise) => exercise.sets.length > 0);
    if (!hasSets) {
      throw new Error("Cannot save workout: at least one set is required.");
    }

    // Validate IDs
    this.validateWorkoutIds(templateId, templateExerciseMap);

    // Validate workout data
    const validationErrors = this.validateWorkout(exercises);
    if (validationErrors.length > 0) {
      throw new Error(
        `Cannot save workout:\n${this.formatValidationErrors(validationErrors)}`
      );
    }

    // Prepare and validate date (allow optional date parameter for future extension)
    const dateString = date ?? new Date().toISOString().slice(0, 10);
    const workoutDate = assertDateString(dateString);

    // Type-safe payload construction
    const workoutPayload: WorkoutPayload = {
      date: workoutDate,
      templateId: templateId ? assertUUID(templateId) : undefined,
      exercises: exercises.map((exercise) => {
        const templateExerciseId = templateExerciseMap.get(exercise.id);
        return {
          name: exercise.name,
          templateExerciseId: templateExerciseId
            ? assertUUID(templateExerciseId)
            : undefined,
          sets: exercise.sets.map((set) => ({
            weight: Number(set.weight) || 0,
            reps: Number(set.reps) || 0,
          })),
        };
      }),
    };

    const workoutId = await saveWorkoutData(workoutPayload);
    return assertUUID(workoutId);
  }
}

// Export singleton instance
export const workoutService = new WorkoutService();
