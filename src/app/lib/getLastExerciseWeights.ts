import { supabase } from "./supabase";

type ExerciseWeights = {
  workingWeight: number | null;
  maxWeight: number | null;
  lastReps: number | null;
};

type ExerciseJoinRow = {
  weight: number;
  reps: number;
  created_at: string;
  exercises: {
    id: string;
    name: string;
    created_at: string;
  };
};

export async function getLastExerciseWeights(
  exerciseName: string
): Promise<ExerciseWeights> {
  const normalizedName = exerciseName.trim().replace(/\s+/g, " ");

  const { data, error } = await supabase
    .from("sets")
    .select("weight,reps,created_at,exercises!inner(id,name,created_at)")
    .ilike("exercises.name", normalizedName);

  if (error) {
    throw new Error(error.message ?? "Failed to load exercise sets.");
  }

  if (!data || data.length === 0) {
    return { workingWeight: null, maxWeight: null, lastReps: null };
  }

  const rows = data as unknown as ExerciseJoinRow[];

  const latestExercise = rows.reduce((latest, row) => {
    if (!latest) {
      return row.exercises;
    }
    const latestDate = new Date(latest.created_at);
    const rowDate = new Date(row.exercises.created_at);
    return rowDate > latestDate ? row.exercises : latest;
  }, null as ExerciseJoinRow["exercises"] | null);

  if (!latestExercise) {
    return { workingWeight: null, maxWeight: null, lastReps: null };
  }

  const latestSets = rows.filter(
    (row) => row.exercises.id === latestExercise.id
  );

  if (latestSets.length === 0) {
    return { workingWeight: null, maxWeight: null, lastReps: null };
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
  const lastSet = latestSets.reduce((latest, row) => {
    if (!latest) {
      return row;
    }
    return new Date(row.created_at) > new Date(latest.created_at)
      ? row
      : latest;
  }, null as (typeof latestSets)[number] | null);
  const lastReps = lastSet ? Number(lastSet.reps) : null;

  return { workingWeight, maxWeight, lastReps };
}
