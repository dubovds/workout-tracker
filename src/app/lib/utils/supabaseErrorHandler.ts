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

  // Provide more specific error messages based on error type
  if (message.includes("row-level security") || message.includes("policy") || code === "42501") {
    throw new Error(
      `${defaultMessage} Row Level Security policy violation. Please check database policies.`
    );
  }

  if (message.includes("relation") || message.includes("does not exist") || code === "42P01") {
    throw new Error(
      `${defaultMessage} Table not found. Please ensure database migrations are applied.`
    );
  }

  if (message.includes("permission denied") || code === "42501") {
    throw new Error(
      `${defaultMessage} Permission denied. Please check database access policies.`
    );
  }

  if (message.includes("violates")) {
    throw new Error(`${defaultMessage} Data validation failed.`);
  }

  if (message.includes("duplicate")) {
    throw new Error(`${defaultMessage} Duplicate entry.`);
  }

  if (message.includes("foreign key")) {
    throw new Error(`${defaultMessage} Invalid reference.`);
  }

  // In production, sanitize error message to prevent information leakage
  // In development, show more details
  const sanitized = process.env.NODE_ENV === "development"
    ? error.message.substring(0, 300)
    : error.message.substring(0, 100).replace(/[<>]/g, "");

  throw new Error(`${defaultMessage}${sanitized ? `: ${sanitized}` : ""}`);
}
