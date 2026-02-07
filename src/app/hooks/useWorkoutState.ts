import { useCallback } from "react";
import { useToast } from "./useToast";
import { useWorkoutTemplates } from "./useWorkoutTemplates";
import { useWorkoutExercises } from "./useWorkoutExercises";
import { useWorkoutSave } from "./useWorkoutSave";

/**
 * Orchestrates workout feature state by composing focused hooks.
 */
export function useWorkoutState() {
  const { toast, showToast } = useToast();

  const {
    workoutOptions,
    selectedTemplateId,
    setSelectedTemplateId,
    isLoading,
  } = useWorkoutTemplates(showToast);

  const {
    exercises,
    focusSetId,
    setFocusSetId,
    templateExerciseMapRef,
    handleSetChange,
    handleAddSet,
    handleRemoveSet,
    handleSetDone,
  } = useWorkoutExercises(selectedTemplateId, showToast);

  const { isSaving, handleSaveWorkout } = useWorkoutSave({
    selectedTemplateId,
    exercises,
    templateExerciseMapRef,
    onSaved: () => setFocusSetId(null),
    showToast,
  });

  const handleTemplateChange = useCallback((value: string) => {
    setSelectedTemplateId(value);
  }, [setSelectedTemplateId]);

  return {
    workoutOptions,
    selectedTemplateId,
    exercises,
    isSaving,
    isLoading,
    focusSetId,
    toast,
    handleSetChange,
    handleAddSet,
    handleRemoveSet,
    handleSetDone,
    handleTemplateChange,
    handleSaveWorkout,
  };
}
