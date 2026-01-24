import { getSupabaseClient } from "./supabase";
import { normalizeExerciseName } from "./utils";

type ExerciseWeights = Readonly<{
  workingWeight: number | null;
  maxWeight: number | null;
  lastReps: number | null;
}>;

type ExerciseRecord = Readonly<{
  id: string;
  name: string;
  created_at: string;
}>;

type ExerciseSetJoin = Readonly<{
  weight: number;
  reps: number;
  created_at: string;
  exercises: ExerciseRecord;
}>;

const EMPTY_WEIGHTS: ExerciseWeights = {
  workingWeight: null,
  maxWeight: null,
  lastReps: null,
};

export async function getLastExerciseWeights(
  exerciseName: string
): Promise<ExerciseWeights> {
  // Validate input
  if (!exerciseName || typeof exerciseName !== "string") {
    return EMPTY_WEIGHTS;
  }

  const normalizedName = normalizeExerciseName(exerciseName);
  
  // Additional validation after normalization
  if (!normalizedName || normalizedName.length === 0) {
    return EMPTY_WEIGHTS;
  }

  const supabase = getSupabaseClient();

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

  // Type-safe assertion after validation
  if (!Array.isArray(data)) {
    return EMPTY_WEIGHTS;
  }
  
  // Type-safe conversion with proper typing
  const rows: ExerciseSetJoin[] = data.map((row) => {
    // Supabase returns exercises as array, but we expect single object
    const exerciseData = Array.isArray(row.exercises) ? row.exercises[0] : row.exercises;
    return {
      weight: Number(row.weight),
      reps: Number(row.reps),
      created_at: String(row.created_at),
      exercises: {
        id: String(exerciseData?.id ?? ""),
        name: String(exerciseData?.name ?? ""),
        created_at: String(exerciseData?.created_at ?? ""),
      },
    };
  });

  const latestExercise = rows.reduce<ExerciseRecord | null>((latest, row) => {
    const exercise = row.exercises;
    if (!latest) {
      return exercise;
    }
    const latestDate = new Date(latest.created_at);
    const rowDate = new Date(exercise.created_at);
    return rowDate > latestDate ? exercise : latest;
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

  // Find most frequently used weight (working weight)
  let mostFrequentWeight = weights[0];
  let maxFrequency = 0;
  frequency.forEach((count, weight) => {
    if (count > maxFrequency || (count === maxFrequency && weight > mostFrequentWeight)) {
      mostFrequentWeight = weight;
      maxFrequency = count;
    }
  });

  // Safe max calculation - handle empty array case
  const maxWeight = weights.length > 0 ? Math.max(...weights) : 0;
  const lastSet = latestSets.reduce<ExerciseSetJoin | null>((latest, row) => {
    if (!latest) {
      return row;
    }
    return new Date(row.created_at) > new Date(latest.created_at)
      ? row
      : latest;
  }, null);
  const lastReps = lastSet ? Number(lastSet.reps) : null;

  return { 
    workingWeight: mostFrequentWeight, 
    maxWeight, 
    lastReps 
  };
}
