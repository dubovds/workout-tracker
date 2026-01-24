import Select, { SelectOption } from "./Select";

type WorkoutSelectorProps = Readonly<{
  value: string;
  options: ReadonlyArray<SelectOption>;
  onChange: (value: string) => void;
}>;

export default function WorkoutSelector({
  value,
  options,
  onChange,
}: WorkoutSelectorProps) {
  return (
    <section className="relative z-50 rounded-2xl border border-zinc-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-900/70">
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
        Workout
      </label>
      <div className="relative mt-3">
        <Select
          value={value}
          options={options}
          onChange={onChange}
          placeholder="Select workout"
          aria-label="Select workout template"
        />
      </div>
    </section>
  );
}
