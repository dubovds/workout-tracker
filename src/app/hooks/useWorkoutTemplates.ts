import { useEffect, useState } from "react";
import type { SelectOption } from "../components/Select";
import { workoutService } from "../lib/services/workoutService";
import { getErrorMessage } from "../lib/utils/errorHandler";
import type { ToastVariant } from "./useToast";

type ShowToast = (message: string, variant: ToastVariant) => void;

export function useWorkoutTemplates(showToast: ShowToast) {
  const [workoutOptions, setWorkoutOptions] = useState<SelectOption[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        const options = await workoutService.loadWorkoutTemplateOptions();
        if (cancelled) return;

        setWorkoutOptions([...options]);
        if (options.length > 0) {
          setSelectedTemplateId(options[0].id);
        } else {
          showToast(
            "No workout templates found. Please ensure database migrations are applied.",
            "error"
          );
        }
      } catch (error) {
        if (cancelled) return;
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (
          errorMessage.includes("Missing Supabase environment variables") ||
          errorMessage.includes("environment variables")
        ) {
          showToast(
            "Configuration error: Supabase environment variables are missing. Please check Vercel settings.",
            "error"
          );
        } else {
          showToast(getErrorMessage(error, "Failed to load workout templates."), "error");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadTemplates();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  return {
    workoutOptions,
    selectedTemplateId,
    setSelectedTemplateId,
    isLoading,
  };
}
