import { useCallback, useEffect, useRef, useState } from "react";
import { workoutService } from "../lib/services/workoutService";
import { WORKOUT_CONSTANTS } from "../lib/constants";
import { getErrorMessage } from "../lib/utils/errorHandler";
import type { ExerciseEntry } from "../lib/types/workout";
import type { ToastVariant } from "./useToast";

type ShowToast = (message: string, variant: ToastVariant) => void;

type UseWorkoutSaveParams = {
  selectedTemplateId: string | null;
  exercises: ExerciseEntry[];
  templateExerciseMapRef: { current: Map<string, string> };
  onSaved?: () => void;
  showToast: ShowToast;
};

export function useWorkoutSave({
  selectedTemplateId,
  exercises,
  templateExerciseMapRef,
  onSaved,
  showToast,
}: UseWorkoutSaveParams) {
  const [isSaving, setIsSaving] = useState(false);
  const lastSaveRef = useRef<number>(0);
  const exercisesRef = useRef<ExerciseEntry[]>([]);

  useEffect(() => {
    exercisesRef.current = exercises;
  }, [exercises]);

  const handleSaveWorkout = useCallback(async () => {
    const now = Date.now();
    if (now - lastSaveRef.current < WORKOUT_CONSTANTS.SAVE_COOLDOWN_MS) {
      showToast("Please wait before saving again.", "error");
      return;
    }
    lastSaveRef.current = now;

    setIsSaving(true);
    try {
      const workoutId = await workoutService.saveWorkout(
        selectedTemplateId,
        exercisesRef.current,
        templateExerciseMapRef.current
      );
      showToast(`Workout saved (${workoutId.slice(0, 6)})`, "success");
      onSaved?.();
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to save workout. Please try again."), "error");
    } finally {
      setIsSaving(false);
    }
  }, [onSaved, selectedTemplateId, showToast, templateExerciseMapRef]);

  return {
    isSaving,
    handleSaveWorkout,
  };
}
