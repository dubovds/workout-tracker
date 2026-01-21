"use client";

import { useState } from "react";
import SetRow from "./SetRow";

export type SetEntry = {
  id: string;
  weight: number;
  reps: number;
};

export type ExerciseEntry = {
  id: string;
  name: string;
  sets: SetEntry[];
};

type ExerciseAccordionProps = {
  exercises: ExerciseEntry[];
  onSetChange: (
    exerciseId: string,
    setId: string,
    field: "weight" | "reps",
    value: number
  ) => void;
  onAddSet: (exerciseId: string) => void;
  onRemoveSet: (exerciseId: string, setId: string) => void;
};

const getWeightSummary = (sets: SetEntry[]) => {
  if (sets.length === 0) {
    return "-- / -- kg";
  }

  const frequency = new Map<number, number>();
  sets.forEach((set) => {
    frequency.set(set.weight, (frequency.get(set.weight) ?? 0) + 1);
  });

  let dominant = sets[0].weight;
  let dominantCount = 0;
  frequency.forEach((count, weight) => {
    if (count > dominantCount || (count === dominantCount && weight > dominant)) {
      dominant = weight;
      dominantCount = count;
    }
  });

  const maxWeight = Math.max(...sets.map((set) => set.weight));

  return `${dominant} / ${maxWeight} kg`;
};

export default function ExerciseAccordion({
  exercises,
  onSetChange,
  onAddSet,
  onRemoveSet,
}: ExerciseAccordionProps) {
  const [openExerciseId, setOpenExerciseId] = useState<string | null>(
    exercises[0]?.id ?? null
  );

  return (
    <section className="space-y-4">
      {exercises.map((exercise) => {
        const isOpen = exercise.id === openExerciseId;

        return (
          <article
            key={exercise.id}
            className="rounded-xl border border-zinc-200/70 bg-white/80 p-2 shadow-sm backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-900/70"
          >
            <button
              type="button"
              onClick={() =>
                setOpenExerciseId(isOpen ? null : exercise.id)
              }
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
                  {getWeightSummary(exercise.sets)}
                </span>
              </div>
              <span className="hidden text-xs font-bold text-zinc-500 dark:text-zinc-300 sm:inline-flex sm:justify-self-end">
                {getWeightSummary(exercise.sets)}
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
                {exercise.sets.map((set, index) => (
                  <div key={set.id} className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                      Set {index + 1}
                    </p>
                    <SetRow
                      weight={set.weight}
                      reps={set.reps}
                      onWeightChange={(value) =>
                        onSetChange(exercise.id, set.id, "weight", value)
                      }
                      onRepsChange={(value) =>
                        onSetChange(exercise.id, set.id, "reps", value)
                      }
                      onRemove={() => onRemoveSet(exercise.id, set.id)}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => onAddSet(exercise.id)}
                  className="flex h-12 w-full items-center justify-center rounded-xl border border-dashed border-emerald-300 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-500 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-emerald-700/70 dark:text-emerald-400 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
                >
                  Add set
                </button>
              </div>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}
