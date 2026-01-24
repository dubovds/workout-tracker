/**
 * Handles Supabase errors consistently across repositories
 * Sanitizes error messages to prevent information leakage
 */
export function handleSupabaseError(
  error: { message?: string } | null,
  defaultMessage: string
): never {
  // Don't expose internal Supabase error details to client
  // Log full error server-side if needed, but return generic message
  const sanitizedMessage = error?.message
    ? // Only include safe parts of error message
      error.message.includes("violates")
      ? "Data validation failed."
      : error.message.includes("duplicate")
      ? "Duplicate entry."
      : error.message.includes("foreign key")
      ? "Invalid reference."
      : defaultMessage
    : defaultMessage;

  throw new Error(sanitizedMessage);
}
