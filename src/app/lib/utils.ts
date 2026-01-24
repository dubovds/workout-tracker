import { sanitizeString } from "./utils/validation";

/**
 * Normalizes and sanitizes exercise name
 */
export function normalizeExerciseName(name: string): string {
  const sanitized = sanitizeString(name, 200);
  return sanitized.trim().replace(/\s+/g, " ");
}
