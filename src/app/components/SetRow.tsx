type SetRowProps = Readonly<{
  weight: number;
  reps: number;
  done?: boolean;
  onWeightChange: (value: number) => void;
  onRepsChange: (value: number) => void;
  onDoneChange: (done: boolean) => void;
  onRemove: () => void;
  autoFocus?: boolean;
}>;

export default function SetRow({
  weight,
  reps,
  done = false,
  onWeightChange,
  onRepsChange,
  onDoneChange,
  onRemove,
  autoFocus = false,
}: SetRowProps) {
  return (
    <div className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-3">
      <label
        className={`flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 ${done ? "opacity-60" : ""}`}
      >
        Weight
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step={0.5}
          value={weight}
          autoFocus={autoFocus}
          aria-label="Weight in kilograms"
          readOnly={done}
          onChange={(event) => {
            const val = Number(event.target.value);
            if (!isNaN(val) && val >= 0 && isFinite(val)) {
              onWeightChange(val);
            }
          }}
          className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-3 text-base font-medium text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/30"
        />
      </label>
      <label
        className={`flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 ${done ? "opacity-60" : ""}`}
      >
        Reps
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={reps}
          aria-label="Number of repetitions"
          readOnly={done}
          onChange={(event) => {
            const val = Number(event.target.value);
            if (!isNaN(val) && val >= 1 && isFinite(val)) {
              onRepsChange(val);
            }
          }}
          className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-3 text-base font-medium text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/30"
        />
      </label>
      <button
        type="button"
        onClick={() => onDoneChange(!done)}
        aria-label={done ? "Mark set as not completed" : "Set completed"}
        title={done ? "Mark set as not completed (unlock to edit)" : "Set completed (lock weight and reps)"}
        aria-pressed={done}
        className="mt-5 flex h-12 min-h-[44px] w-12 min-w-[44px] items-center justify-center rounded-xl border border-zinc-200 text-zinc-400 transition hover:border-emerald-400 hover:text-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-emerald-400 dark:hover:text-emerald-400 data-[pressed=true]:border-emerald-400 data-[pressed=true]:bg-emerald-50 data-[pressed=true]:text-emerald-600 dark:data-[pressed=true]:border-emerald-500 dark:data-[pressed=true]:bg-emerald-500/20 dark:data-[pressed=true]:text-emerald-400"
        data-pressed={done}
      >
        {done ? (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span
            className="h-5 w-5 rounded-full border-2 border-current"
            aria-hidden
          />
        )}
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove set"
        title="Remove set"
        className="mt-5 flex h-12 min-h-[44px] w-12 min-w-[44px] items-center justify-center rounded-xl border border-zinc-200 text-zinc-400 transition hover:border-rose-400 hover:text-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-rose-400 dark:hover:text-rose-400"
      >
        <span className="text-xl leading-none" aria-hidden="true">
          ×
        </span>
      </button>
    </div>
  );
}
