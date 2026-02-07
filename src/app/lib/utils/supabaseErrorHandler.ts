/**
 * Handles Supabase errors consistently across repositories
 * Sanitizes error messages to prevent information leakage
 */
export function handleSupabaseError(
  error: { message?: string; code?: string; details?: string } | null,
  defaultMessage: string
): never {
  // Log full error in development for debugging
  if (process.env.NODE_ENV === "development" && error) {
    console.error("Supabase error:", {
      message: error.message,
      code: error.code,
      details: error.details,
    });
  }

  if (!error || !error.message) {
    throw new Error(defaultMessage);
  }

  const message = error.message.toLowerCase();
  const code = error.code;
  const isDevelopment = process.env.NODE_ENV === "development";

  // Provide more specific error messages based on error type
  if (message.includes("row-level security") || message.includes("policy") || code === "42501") {
    throw new Error("Action is not available right now.");
  }

  if (message.includes("relation") || message.includes("does not exist") || code === "42P01") {
    throw new Error("Service is temporarily unavailable.");
  }

  if (message.includes("permission denied") || code === "42501") {
    throw new Error("Action is not available right now.");
  }

  if (message.includes("violates")) {
    throw new Error("Invalid data.");
  }

  if (message.includes("duplicate")) {
    throw new Error("Duplicate entry.");
  }

  if (message.includes("foreign key")) {
    throw new Error("Invalid reference.");
  }

  // Avoid leaking backend details in production.
  if (isDevelopment) {
    throw new Error(`${defaultMessage} ${error.message.substring(0, 300)}`);
  }

  throw new Error(defaultMessage);
}
