type SetRowProps = {
  weight: number;
  reps: number;
  onWeightChange: (value: number) => void;
  onRepsChange: (value: number) => void;
  onRemove: () => void;
};

export default function SetRow({
  weight,
  reps,
  onWeightChange,
  onRepsChange,
  onRemove,
}: SetRowProps) {
  return (
    <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-3">
      <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Weight
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={weight}
          onChange={(event) => onWeightChange(Number(event.target.value))}
          className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-3 text-base font-medium text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/30"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Reps
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={reps}
          onChange={(event) => onRepsChange(Number(event.target.value))}
          className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-3 text-base font-medium text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/30"
        />
      </label>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove set"
        className="mt-5 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 text-zinc-400 transition hover:border-rose-400 hover:text-rose-500 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-rose-400 dark:hover:text-rose-400"
      >
        <span className="text-xl leading-none">x</span>
      </button>
    </div>
  );
}
