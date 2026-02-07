import { useCallback, useEffect, useRef, useState } from "react";
import type { ExerciseEntry } from "../lib/types/workout";
import { workoutService } from "../lib/services/workoutService";
import { getErrorMessage } from "../lib/utils/errorHandler";
import type { ToastVariant } from "./useToast";

type ShowToast = (message: string, variant: ToastVariant) => void;

export function useWorkoutExercises(
  selectedTemplateId: string | null,
  showToast: ShowToast
) {
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [focusSetId, setFocusSetId] = useState<string | null>(null);
  const templateExerciseMapRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!selectedTemplateId) return;

    let cancelled = false;

    const loadExercises = async () => {
      try {
        const { exercises: exerciseEntries, templateExerciseMap } =
          await workoutService.loadTemplateExercises(selectedTemplateId);

        if (cancelled) return;
        templateExerciseMapRef.current = templateExerciseMap;
        setExercises([...exerciseEntries]);
        setFocusSetId(null);
      } catch (error) {
        if (cancelled) return;
        showToast(getErrorMessage(error, "Failed to load exercises."), "error");
      }
    };

    void loadExercises();
    return () => {
      cancelled = true;
    };
  }, [selectedTemplateId, showToast]);

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
    (exerciseId: string, defaultWeight = 0, defaultReps?: number) => {
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
            done: false,
          };
          return {
            ...exercise,
            sets: [...exercise.sets, newSet] as ReadonlyArray<
              ExerciseEntry["sets"][number]
            >,
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
        if (exercise && exercise.sets.length === 1) {
          showToast(
            "Cannot remove the last set. Each exercise must have at least one set.",
            "error"
          );
          return prevExercises;
        }

        return prevExercises.map((entry) => {
          if (entry.id !== exerciseId) {
            return entry;
          }
          return {
            ...entry,
            sets: entry.sets.filter((set) => set.id !== setId) as ReadonlyArray<
              ExerciseEntry["sets"][number]
            >,
          };
        });
      });
    },
    [showToast]
  );

  const handleSetDone = useCallback((exerciseId: string, setId: string, done: boolean) => {
    setExercises((prevExercises) =>
      prevExercises.map((exercise) => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }
        return {
          ...exercise,
          sets: exercise.sets.map((set) =>
            set.id === setId ? { ...set, done } : set
          ) as ReadonlyArray<ExerciseEntry["sets"][number]>,
        };
      })
    );
  }, []);

  return {
    exercises,
    focusSetId,
    setFocusSetId,
    templateExerciseMapRef,
    handleSetChange,
    handleAddSet,
    handleRemoveSet,
    handleSetDone,
  };
}
