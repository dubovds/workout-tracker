import { getSupabaseClient } from "../supabase";
import { handleSupabaseError } from "../utils/supabaseErrorHandler";
import { isValidUUID } from "../utils/validation";
import type { UUID } from "../types/common";
import { assertUUID } from "../types/common";

export type WorkoutTemplate = {
  id: UUID;
  name: string;
  created_at: string;
};

export type WorkoutTemplateExercise = {
  id: UUID;
  template_id: UUID;
  name: string;
  sort_order: number;
  created_at: string;
};

export async function getWorkoutTemplates(): Promise<WorkoutTemplate[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("workout_templates")
      .select("id, name, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      // Log error details for debugging
      if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.error("Supabase query error:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
      }
      handleSupabaseError(error, "Failed to load workout templates.");
      // handleSupabaseError throws, but TypeScript doesn't know that
      throw new Error("Failed to load workout templates."); // Unreachable
    }

    // Type-safe conversion with validation
    return (data ?? []).map((row) => ({
      ...row,
      id: assertUUID(row.id),
    })) as WorkoutTemplate[];
  } catch (err) {
    // Re-throw with additional context if it's not already a handled error
    if (err instanceof Error && !err.message.includes("Failed to load")) {
      throw new Error(`Failed to load workout templates: ${err.message}`);
    }
    throw err;
  }
}

export async function getWorkoutTemplateExercises(
  templateId: string
): Promise<WorkoutTemplateExercise[]> {
  // Validate UUID format to prevent injection
  if (!isValidUUID(templateId)) {
    throw new Error("Invalid template ID format.");
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("workout_template_exercises")
    .select("id, template_id, name, sort_order, created_at")
    .eq("template_id", templateId)
    .order("sort_order", { ascending: true });

  if (error) {
    handleSupabaseError(error, "Failed to load workout template exercises.");
    // handleSupabaseError throws, but TypeScript doesn't know that
    throw new Error("Failed to load workout template exercises."); // Unreachable
  }

  // Type-safe conversion with validation
  return (data ?? []).map((row) => ({
    ...row,
    id: assertUUID(row.id),
    template_id: assertUUID(row.template_id),
  })) as WorkoutTemplateExercise[];
}
