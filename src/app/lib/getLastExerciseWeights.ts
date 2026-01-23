import { supabase } from "./supabase";
import { normalizeExerciseName } from "./utils";

type ExerciseWeights = {
  workingWeight: number | null;
  maxWeight: number | null;
  lastReps: number | null;
};

type ExerciseRecord = {
  id: string;
  name: string;
  created_at: string;
};

type ExerciseSetJoin = {
  weight: number;
  reps: number;
  created_at: string;
  exercises: ExerciseRecord;
};

const EMPTY_WEIGHTS: ExerciseWeights = {
  workingWeight: null,
  maxWeight: null,
  lastReps: null,
};

export async function getLastExerciseWeights(
  exerciseName: string
): Promise<ExerciseWeights> {
  const normalizedName = normalizeExerciseName(exerciseName);

  const { data, error } = await supabase
    .from("sets")
    .select("weight,reps,created_at,exercises!inner(id,name,created_at)")
    .ilike("exercises.name", normalizedName);

  if (error) {
    throw new Error(error.message ?? "Failed to load exercise sets.");
  }

  if (!data || data.length === 0) {
    return EMPTY_WEIGHTS;
  }

  const rows = data as unknown as ExerciseSetJoin[];

  const latestExercise = rows.reduce<ExerciseRecord | null>((latest, row) => {
    const rowTyped = row as ExerciseSetJoin;
    const exercise = rowTyped.exercises as ExerciseRecord;
    if (!latest) {
      return exercise;
    }
    const latestTyped = latest as ExerciseRecord;
    const latestDate = new Date(latestTyped.created_at);
    const rowDate = new Date(exercise.created_at);
    return rowDate > latestDate ? exercise : latestTyped;
  }, null);

  if (!latestExercise) {
    return EMPTY_WEIGHTS;
  }

  const latestSets = rows.filter((row) => {
    return row.exercises.id === latestExercise.id;
  });

  if (latestSets.length === 0) {
    return EMPTY_WEIGHTS;
  }

  const weights = latestSets.map((row) => Number(row.weight));
  const frequency = new Map<number, number>();
  weights.forEach((weight) => {
    frequency.set(weight, (frequency.get(weight) ?? 0) + 1);
  });

  let workingWeight = weights[0];
  let dominantCount = 0;
  frequency.forEach((count, weight) => {
    if (count > dominantCount || (count === dominantCount && weight > workingWeight)) {
      workingWeight = weight;
      dominantCount = count;
    }
  });

  const maxWeight = Math.max(...weights);
  const lastSet = latestSets.reduce<ExerciseSetJoin | null>((latest, row) => {
    if (!latest) {
      return row;
    }
    return new Date(row.created_at) > new Date(latest.created_at)
      ? row
      : latest;
  }, null);
  const lastReps = lastSet ? Number(lastSet.reps) : null;

  return { workingWeight, maxWeight, lastReps };
}
