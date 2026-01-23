"use client";

import { useEffect, useRef, useState } from "react";
import ExerciseAccordion, {
  ExerciseEntry,
  SetEntry,
} from "./components/ExerciseAccordion";
import SaveWorkoutButton from "./components/SaveWorkoutButton";
import WorkoutSelector from "./components/WorkoutSelector";
import { EXERCISES } from "./lib/exercises";
import { saveWorkout } from "./lib/saveWorkout";

export default function Home() {
  const workoutOptions = [
    { id: "full-body-a", label: "Full Body A" },
    { id: "upper-push", label: "Upper Push" },
    { id: "lower-focus", label: "Lower Focus" },
  ];

  const initialExercises: ExerciseEntry[] = EXERCISES.map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    sets: [],
  }));

  const [workoutId, setWorkoutId] = useState(workoutOptions[0].id);
  const [exercises, setExercises] = useState<ExerciseEntry[]>(
    initialExercises
  );
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [focusSetId, setFocusSetId] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const showToast = (message: string, variant: "success" | "error") => {
    setToast({ message, variant });
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const updateExercise = (
    exerciseId: string,
    updater: (exercise: ExerciseEntry) => ExerciseEntry
  ) => {
    setExercises((prevExercises) =>
      prevExercises.map((exercise) =>
        exercise.id === exerciseId ? updater(exercise) : exercise
      )
    );
  };

  const handleSetChange = (
    exerciseId: string,
    setId: string,
    field: "weight" | "reps",
    value: number
  ) => {
    updateExercise(exerciseId, (exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set) =>
        set.id === setId ? { ...set, [field]: value } : set
      ),
    }));
  };

  const handleAddSet = (
    exerciseId: string,
    defaultWeight = 0,
    defaultReps?: number
  ) => {
    const newSetId = `${exerciseId}-set-${crypto.randomUUID()}`;
    setFocusSetId(newSetId);
    updateExercise(exerciseId, (exercise) => {
      const lastSet = exercise.sets[exercise.sets.length - 1];
      const newSet: SetEntry = {
        id: newSetId,
        weight: lastSet?.weight ?? defaultWeight,
        reps: lastSet?.reps ?? defaultReps ?? 8,
      };
      return {
        ...exercise,
        sets: [...exercise.sets, newSet],
      };
    });
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    updateExercise(exerciseId, (exercise) => ({
      ...exercise,
      sets: exercise.sets.filter((set) => set.id !== setId),
    }));
  };

  const handleSaveWorkout = async () => {
    setToast(null);
    setIsSaving(true);
    try {
      const validationErrors: string[] = [];
      exercises.forEach((exercise) => {
        exercise.sets.forEach((set, index) => {
          const repsValue = Number(set.reps);
          if (!Number.isFinite(repsValue) || repsValue <= 0) {
            validationErrors.push(
              `${exercise.name} — Set ${index + 1}: reps must be a positive number`
            );
          }
          const weightValue = Number(set.weight);
          if (!Number.isFinite(weightValue) || weightValue < 0) {
            validationErrors.push(
              `${exercise.name} — Set ${index + 1}: weight must be a non-negative number`
            );
          }
        });
      });

      if (validationErrors.length > 0) {
        showToast(
          `Cannot save workout:\n${validationErrors.join("\n")}`,
          "error"
        );
        setIsSaving(false);
        return;
      }

      const workoutId = await saveWorkout({
        date: new Date().toISOString().slice(0, 10),
        exercises: exercises.map((exercise) => ({
          name: exercise.name,
          sets: exercise.sets.map((set) => ({
            weight: Number(set.weight) || 0,
            reps: set.reps,
          })),
        })),
      });
      showToast(`Workout saved (${workoutId.slice(0, 6)})`, "success");
    } catch (error) {
      showToast("Failed to save workout. Check Supabase keys.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-400/20" />
      <div className="pointer-events-none absolute -bottom-40 left-0 h-72 w-72 rounded-full bg-orange-200/50 blur-3xl dark:bg-orange-400/20" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_top,_rgba(39,39,42,0.6),_rgba(9,9,11,0))]" />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 pb-28 pt-8 font-sans sm:px-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600/80 dark:text-emerald-400/80">
              Active workout
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Session builder
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Stay focused, log each set in under a minute.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200/70 bg-white/70 px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 shadow-sm backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-900/70 dark:text-zinc-400">
            Today
          </div>
        </header>
        {toast ? (
          <div
            role="status"
            className="fixed left-1/2 top-4 z-30 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 sm:top-6"
          >
            <div
              className={`whitespace-pre-line rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur ${
                toast.variant === "success"
                  ? "border-emerald-200 bg-emerald-50/90 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-100"
                  : "border-rose-200 bg-rose-50/90 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/20 dark:text-rose-100"
              }`}
            >
              {toast.message}
            </div>
          </div>
        ) : null}

        <WorkoutSelector
          value={workoutId}
          options={workoutOptions}
          onChange={setWorkoutId}
        />

        <ExerciseAccordion
          exercises={exercises}
          focusSetId={focusSetId}
          onSetChange={handleSetChange}
          onAddSet={handleAddSet}
          onRemoveSet={handleRemoveSet}
        />
      </main>

      <SaveWorkoutButton onClick={handleSaveWorkout} isSaving={isSaving} />
    </div>
  );
}
