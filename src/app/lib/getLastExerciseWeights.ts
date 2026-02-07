import { getSupabaseClient } from "./supabase";
import { normalizeExerciseName } from "./utils";

export type ExerciseWeights = Readonly<{
  workingWeight: number | null;
  maxWeight: number | null;
  lastReps: number | null;
}>;

type WeightsBatchRow = {
  exercise_name: string;
  working_weight: number | null;
  max_weight: number | null;
  last_reps: number | null;
};

function isWeightsBatchRow(value: unknown): value is WeightsBatchRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Record<string, unknown>;
  const hasStringName = typeof row.exercise_name === "string";
  const hasValidWorkingWeight =
    row.working_weight === null || row.working_weight === undefined || Number.isFinite(Number(row.working_weight));
  const hasValidMaxWeight =
    row.max_weight === null || row.max_weight === undefined || Number.isFinite(Number(row.max_weight));
  const hasValidLastReps =
    row.last_reps === null || row.last_reps === undefined || Number.isFinite(Number(row.last_reps));

  return hasStringName && hasValidWorkingWeight && hasValidMaxWeight && hasValidLastReps;
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export async function getLastExerciseWeightsBatch(
  exerciseNames: ReadonlyArray<string>
): Promise<Record<string, ExerciseWeights>> {
  const normalizedNames = Array.from(
    new Set(
      exerciseNames
        .map((name) => normalizeExerciseName(name))
        .filter((name) => name.length > 0)
    )
  );

  if (normalizedNames.length === 0) {
    return {};
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("get_last_exercise_weights_batch", {
    p_exercise_names: normalizedNames,
  });

  if (error) {
    throw new Error(error.message ?? "Failed to load exercise weights.");
  }

  if (!Array.isArray(data)) {
    throw new Error("Unexpected response format while loading exercise weights.");
  }

  const rows = data.filter(isWeightsBatchRow);
  if (rows.length !== data.length) {
    throw new Error("Unexpected row format while loading exercise weights.");
  }
  const byName: Record<string, ExerciseWeights> = {};

  for (const row of rows) {
    const normalizedName = normalizeExerciseName(String(row.exercise_name ?? ""));
    if (!normalizedName) continue;
    byName[normalizedName] = {
      workingWeight: toNullableNumber(row.working_weight),
      maxWeight: toNullableNumber(row.max_weight),
      lastReps: toNullableNumber(row.last_reps),
    };
  }

  return byName;
}
