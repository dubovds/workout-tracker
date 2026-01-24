/**
 * Centralized error handling for UI
 * Provides consistent error messages for development and production
 */
export function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error && process.env.NODE_ENV === "development") {
    return error.message;
  }
  return defaultMessage;
}
