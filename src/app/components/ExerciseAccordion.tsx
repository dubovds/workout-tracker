"use client";

import { useEffect, useMemo, useState } from "react";
import SetRow from "./SetRow";
import {
  getLastExerciseWeightsBatch,
  type ExerciseWeights,
} from "../lib/getLastExerciseWeights";
import { normalizeExerciseName } from "../lib/utils";
import type { SetEntry, ExerciseEntry } from "../lib/types/workout";

// Re-export types for backward compatibility
export type { SetEntry, ExerciseEntry };

type SetField = "weight" | "reps";

type ExerciseAccordionProps = {
  exercises: ReadonlyArray<ExerciseEntry>;
  focusSetId?: string | null;
  onSetChange: (
    exerciseId: string,
    setId: string,
    field: SetField,
    value: number
  ) => void;
  onAddSet: (
    exerciseId: string,
    defaultWeight?: number,
    defaultReps?: number
  ) => void;
  onRemoveSet: (exerciseId: string, setId: string) => void;
  onSetDone: (exerciseId: string, setId: string, done: boolean) => void;
};

const formatWeightSummary = (
  workingWeight: number | null,
  maxWeight: number | null
) => {
  if (workingWeight === null || maxWeight === null) {
    return "-- / -- kg";
  }

  return `${workingWeight} / ${maxWeight} kg`;
};

const EMPTY_WEIGHTS: ExerciseWeights = {
  workingWeight: null,
  maxWeight: null,
  lastReps: null,
};

export default function ExerciseAccordion({
  exercises,
  focusSetId,
  onSetChange,
  onAddSet,
  onRemoveSet,
  onSetDone,
}: ExerciseAccordionProps) {
  const [openExerciseId, setOpenExerciseId] = useState<string | null>(null);

  // Sync openExerciseId when exercises change
  useEffect(() => {
    if (exercises.length > 0 && !openExerciseId) {
      setOpenExerciseId(exercises[0].id);
    } else if (exercises.length === 0) {
      setOpenExerciseId(null);
    }
  }, [exercises, openExerciseId]);
  const [weightCache, setWeightCache] = useState<
    Record<
      string,
      { workingWeight: number | null; maxWeight: number | null; lastReps: number | null }
    >
  >({});
  const [isLoadingWeights, setIsLoadingWeights] = useState(false);

  // Memoize weight summaries for all exercises to avoid recalculating on every render
  const weightSummaries = useMemo(() => {
    const summaries: Record<string, string> = {};
    exercises.forEach((exercise) => {
      const cachedWeights = weightCache[exercise.id];
      const workingWeight = cachedWeights?.workingWeight ?? null;
      const maxWeight = cachedWeights?.maxWeight ?? null;
      summaries[exercise.id] = formatWeightSummary(workingWeight, maxWeight);
    });
    return summaries;
  }, [exercises, weightCache]);

  useEffect(() => {
    if (exercises.length === 0) {
      setWeightCache({});
      setIsLoadingWeights(false);
      return;
    }

    let cancelled = false;
    const exerciseNames = exercises.map((exercise) => exercise.name);

    const loadBatch = async () => {
      setIsLoadingWeights(true);
      try {
        const byName = await getLastExerciseWeightsBatch(exerciseNames);
        if (cancelled) return;

        const nextCache: Record<string, ExerciseWeights> = {};
        for (const exercise of exercises) {
          const normalizedName = normalizeExerciseName(exercise.name);
          nextCache[exercise.id] = byName[normalizedName] ?? EMPTY_WEIGHTS;
        }
        setWeightCache(nextCache);
      } catch {
        if (cancelled) return;
        const fallbackCache: Record<string, ExerciseWeights> = {};
        for (const exercise of exercises) {
          fallbackCache[exercise.id] = EMPTY_WEIGHTS;
        }
        setWeightCache(fallbackCache);
      } finally {
        if (!cancelled) {
          setIsLoadingWeights(false);
        }
      }
    };

    void loadBatch();
    return () => {
      cancelled = true;
    };
  }, [exercises]);

  useEffect(() => {
    if (!openExerciseId) return;
    
    const exercise = exercises.find((item) => item.id === openExerciseId);
    if (!exercise || exercise.sets.length > 0) return;
    
    const cached = weightCache[exercise.id];
    if (!cached) return;
    
    onAddSet(
      exercise.id,
      cached.workingWeight ?? 0,
      cached.lastReps ?? undefined
    );
  }, [openExerciseId, exercises, weightCache, onAddSet]);

  return (
    <section className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70">
      {exercises.length === 0 ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-2xl border border-zinc-200/70 bg-white/80 p-8 text-center backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-900/70"
        >
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            No exercises available. Select a workout template to get started.
          </p>
        </div>
      ) : (
        exercises.map((exercise) => {
        const isOpen = exercise.id === openExerciseId;
        const summary = weightSummaries[exercise.id] ?? "-- / -- kg";

        return (
          <article
            key={exercise.id}
            className="bg-white/80 px-2 py-4 backdrop-blur dark:bg-zinc-900/70"
          >
            <button
              type="button"
              onClick={() => {
                const nextIsOpen = !isOpen;
                setOpenExerciseId(nextIsOpen ? exercise.id : null);
              }}
              aria-expanded={isOpen}
              className="grid w-full grid-cols-[1fr_auto] items-start gap-3 text-left sm:grid-cols-[1fr_auto_auto] sm:items-center"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500/80 dark:text-emerald-400/70">
                  Exercise
                </p>
                <h3 className="text-normal font-semibold text-zinc-900 dark:text-zinc-100">
                  {exercise.name}
                </h3>
                <span className="mt-2 text-xs font-bold text-zinc-500 dark:text-zinc-300 sm:hidden">
                  {isLoadingWeights ? "Loading..." : summary}
                </span>
              </div>
              <span className="hidden text-xs font-bold text-zinc-500 dark:text-zinc-300 sm:inline-flex sm:justify-self-end">
                {isLoadingWeights ? "Loading..." : summary}
              </span>
              <span
                className={`flex h-8 w-8 items-center justify-center justify-self-end rounded-full border border-zinc-200 text-zinc-400 transition-transform duration-200 dark:border-zinc-700 dark:text-zinc-300 sm:h-9 sm:w-9 ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="sm:h-4 sm:w-4"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </button>

            {isOpen ? (
              <div className="mt-5 space-y-4">
                {exercise.sets.map((set, index) => {
                  const setId = set.id; // Extract id to ensure it's defined
                  if (!setId) return null; // Safety check
                  
                  return (
                    <div key={setId} className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                        Set {index + 1}
                      </p>
                      <SetRow
                        weight={set.weight}
                        reps={set.reps}
                        done={set.done ?? false}
                        autoFocus={setId === focusSetId}
                        onWeightChange={(value) =>
                          onSetChange(exercise.id, setId, "weight", value)
                        }
                        onRepsChange={(value) =>
                          onSetChange(exercise.id, setId, "reps", value)
                        }
                        onDoneChange={(done) =>
                          onSetDone(exercise.id, setId, done)
                        }
                        onRemove={() => onRemoveSet(exercise.id, setId)}
                      />
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    const cached = weightCache[exercise.id];
                    const workingWeight = cached?.workingWeight ?? 0;
                    const lastReps = cached?.lastReps ?? undefined;
                    onAddSet(exercise.id, workingWeight, lastReps);
                  }}
                  aria-label={`Add set to ${exercise.name}`}
                  className="flex h-12 w-full items-center justify-center rounded-xl border border-dashed border-emerald-300 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-500 transition hover:border-emerald-400 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-emerald-700/70 dark:text-emerald-400 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
                >
                  + Add set
                </button>
              </div>
            ) : null}
          </article>
        );
      })
      )}
    </section>
  );
}
