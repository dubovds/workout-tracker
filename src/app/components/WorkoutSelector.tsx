type WorkoutOption = {
  id: string;
  label: string;
};

type WorkoutSelectorProps = {
  value: string;
  options: WorkoutOption[];
  onChange: (value: string) => void;
};

export default function WorkoutSelector({
  value,
  options,
  onChange,
}: WorkoutSelectorProps) {
  return (
    <section className="rounded-2xl border border-zinc-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-900/70">
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
        Workout
      </label>
      <div className="mt-3">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-base font-medium text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/30"
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
