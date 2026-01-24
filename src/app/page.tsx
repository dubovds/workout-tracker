"use client";

import ExerciseAccordion from "./components/ExerciseAccordion";
import SaveWorkoutButton from "./components/SaveWorkoutButton";
import WorkoutSelector from "./components/WorkoutSelector";
import { useWorkoutState } from "./hooks/useWorkoutState";

export default function Home() {
  const {
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
    handleTemplateChange,
    handleSaveWorkout,
  } = useWorkoutState();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-400/20" />
      <div className="pointer-events-none absolute -bottom-40 left-0 h-72 w-72 rounded-full bg-orange-200/50 blur-3xl dark:bg-orange-400/20" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_top,_rgba(39,39,42,0.6),_rgba(9,9,11,0))]" />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-emerald-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
      >
        Skip to main content
      </a>
      <main
        id="main-content"
        className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 pb-28 pt-8 font-sans sm:px-6"
      >
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
            aria-live={toast.variant === "error" ? "assertive" : "polite"}
            aria-atomic="true"
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

        {isLoading ? (
          <div
            role="status"
            aria-live="polite"
            aria-label="Loading workout templates"
            className="rounded-2xl border border-zinc-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-900/70"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-500 dark:border-zinc-600 dark:border-t-emerald-400"
                aria-hidden="true"
              />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Loading workout templates...
              </p>
            </div>
          </div>
        ) : workoutOptions.length === 0 ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-2xl border border-zinc-200/70 bg-white/80 p-8 text-center shadow-sm backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-900/70"
          >
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              No workout templates available.
            </p>
          </div>
        ) : (
          <WorkoutSelector
            value={selectedTemplateId || ""}
            options={workoutOptions}
            onChange={handleTemplateChange}
          />
        )}

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
