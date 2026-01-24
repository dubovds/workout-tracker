import { useCallback, useEffect, useRef, useState } from "react";
import { sanitizeString } from "../lib/utils/validation";
import { WORKOUT_CONSTANTS } from "../lib/constants";

export type ToastVariant = "success" | "error";

export type ToastState = {
  message: string;
  variant: ToastVariant;
} | null;

/**
 * Custom hook for managing toast notifications
 * Provides centralized toast state and display logic
 */
export function useToast() {
  const [toast, setToast] = useState<ToastState>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (message: string, variant: ToastVariant) => {
      // Sanitize message to prevent XSS
      const sanitized = sanitizeString(message, 500);
      setToast({ message: sanitized, variant });

      // Clear existing timeout if any
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Auto-dismiss after duration
      timeoutRef.current = setTimeout(() => {
        setToast(null);
      }, WORKOUT_CONSTANTS.TOAST_DURATION_MS);
    },
    []
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { toast, showToast };
}
