import { useCallback, useEffect, useRef, useState } from "react";
import { workoutService } from "../lib/services/workoutService";
import type { ExerciseEntry } from "../lib/types/workout";
import type { SelectOption } from "../components/Select";
import { getErrorMessage } from "../lib/utils/errorHandler";
import { useToast } from "./useToast";
import { WORKOUT_CONSTANTS } from "../lib/constants";

/**
 * Custom hook for managing workout state and operations
 * Encapsulates all workout-related state and business logic
 */
export function useWorkoutState() {
  const [workoutOptions, setWorkoutOptions] = useState<SelectOption[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [focusSetId, setFocusSetId] = useState<string | null>(null);
  
  const templateExerciseMapRef = useRef<Map<string, string>>(new Map());
  const exercisesRef = useRef<ExerciseEntry[]>([]);
  const lastSaveRef = useRef<number>(0);
  
  const { toast, showToast } = useToast();
  const showToastRef = useRef(showToast);
  
  // Sync refs
  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  useEffect(() => {
    exercisesRef.current = exercises;
  }, [exercises]);

  // Load workout templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        const options = await workoutService.loadWorkoutTemplateOptions();
        setWorkoutOptions([...options]);
        if (options.length > 0) {
          setSelectedTemplateId(options[0].id);
        }
      } catch (error) {
        showToastRef.current(
          getErrorMessage(error, "Failed to load workout templates."),
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Load exercises when template changes
  useEffect(() => {
    if (!selectedTemplateId) return;

    let cancelled = false;

    const loadExercises = async () => {
      try {
        const { exercises: exerciseEntries, templateExerciseMap } =
          await workoutService.loadTemplateExercises(selectedTemplateId);
        
        // Check if request was cancelled before updating state
        if (!cancelled) {
          templateExerciseMapRef.current = templateExerciseMap;
          setExercises([...exerciseEntries]);
        }
      } catch (error) {
        if (!cancelled) {
          showToastRef.current(
            getErrorMessage(error, "Failed to load exercises."),
            "error"
          );
        }
      }
    };

    void loadExercises();
    
    // Cleanup function to cancel request if component unmounts or template changes
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplateId]); // Only depend on selectedTemplateId

  const handleSetChange = useCallback(
    (
      exerciseId: string,
      setId: string,
      field: "weight" | "reps",
      value: number
    ) => {
      setExercises((prevExercises) =>
        prevExercises.map((exercise) => {
          if (exercise.id !== exerciseId) {
            return exercise;
          }
          return {
            ...exercise,
            sets: exercise.sets.map((set) =>
              set.id === setId ? { ...set, [field]: value } : set
            ) as ReadonlyArray<ExerciseEntry["sets"][number]>,
          };
        })
      );
    },
    []
  );

  const handleAddSet = useCallback(
    (
      exerciseId: string,
      defaultWeight = 0,
      defaultReps?: number
    ) => {
      const newSetId = `${exerciseId}-set-${crypto.randomUUID()}`;
      setFocusSetId(newSetId);
      setExercises((prevExercises) =>
        prevExercises.map((exercise) => {
          if (exercise.id !== exerciseId) {
            return exercise;
          }
          const lastSet = exercise.sets[exercise.sets.length - 1];
          const newSet: ExerciseEntry["sets"][number] = {
            id: newSetId,
            weight: lastSet?.weight ?? defaultWeight,
            reps: lastSet?.reps ?? defaultReps ?? 8,
          };
          return {
            ...exercise,
            sets: [...exercise.sets, newSet] as ReadonlyArray<ExerciseEntry["sets"][number]>,
          };
        })
      );
    },
    []
  );

  const handleRemoveSet = useCallback(
    (exerciseId: string, setId: string) => {
      setExercises((prevExercises) => {
        const exercise = prevExercises.find((ex) => ex.id === exerciseId);
        
        // Check if this is the last set in the exercise
        if (exercise && exercise.sets.length === 1) {
          showToast(
            "Cannot remove the last set. Each exercise must have at least one set.",
            "error"
          );
          return prevExercises;
        }

        return prevExercises.map((exercise) => {
          if (exercise.id !== exerciseId) {
            return exercise;
          }
          return {
            ...exercise,
            sets: exercise.sets.filter((set) => set.id !== setId) as ReadonlyArray<ExerciseEntry["sets"][number]>,
          };
        });
      });
    },
    [showToast]
  );

  const handleTemplateChange = useCallback((value: string) => {
    setSelectedTemplateId(value);
  }, []);

  const handleSaveWorkout = useCallback(async () => {
    // Rate limiting check
    const now = Date.now();
    if (now - lastSaveRef.current < WORKOUT_CONSTANTS.SAVE_COOLDOWN_MS) {
      showToast("Please wait before saving again.", "error");
      return;
    }
    lastSaveRef.current = now;

    setIsSaving(true);
    try {
      // Use ref to get current exercises to avoid unnecessary re-renders
      const currentExercises = exercisesRef.current;
      const workoutId = await workoutService.saveWorkout(
        selectedTemplateId,
        currentExercises,
        templateExerciseMapRef.current
      );
      showToast(`Workout saved (${workoutId.slice(0, 6)})`, "success");
      // Clear focus after successful save
      setFocusSetId(null);
    } catch (error) {
      showToast(
        getErrorMessage(error, "Failed to save workout. Please try again."),
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  }, [selectedTemplateId, showToast]);

  return {
    // State
    workoutOptions,
    selectedTemplateId,
    exercises,
    isSaving,
    isLoading,
    focusSetId,
    toast,
    
    // Actions
    handleSetChange,
    handleAddSet,
    handleRemoveSet,
    handleTemplateChange,
    handleSaveWorkout,
  };
}
