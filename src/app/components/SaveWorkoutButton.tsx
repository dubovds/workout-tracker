type SaveWorkoutButtonProps = Readonly<{
  label?: string;
  isSaving?: boolean;
  onClick?: () => void;
}>;

export default function SaveWorkoutButton({
  label = "Save workout",
  isSaving = false,
  onClick,
}: SaveWorkoutButtonProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200/70 bg-white/80 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/70">
      <div className="mx-auto w-full max-w-2xl px-4 pb-4 pt-3 sm:px-6">
        <button
          type="button"
          onClick={onClick}
          disabled={isSaving}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-base font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-emerald-400 dark:text-emerald-950 dark:shadow-emerald-500/20 dark:hover:bg-emerald-300 dark:focus:ring-emerald-200"
        >
          {isSaving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white dark:border-emerald-900/40 dark:border-t-emerald-900" />
              Saving...
            </>
          ) : (
            label
          )}
        </button>
      </div>
    </div>
  );
}
