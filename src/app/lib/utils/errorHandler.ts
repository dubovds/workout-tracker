/**
 * Centralized error handling for UI
 * Provides consistent error messages for development and production
 */
export function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) {
    // In development, show full error message
    if (process.env.NODE_ENV === "development") {
      return error.message;
    }
    
    // In production, check for common Supabase errors and provide helpful messages
    const message = error.message.toLowerCase();
    
    // Network/connection errors
    if (message.includes("fetch") || message.includes("network") || message.includes("connection")) {
      return "Connection error. Please check your internet connection.";
    }
    
    // Authentication errors
    if (message.includes("jwt") || message.includes("auth") || message.includes("unauthorized")) {
      return "Authentication error. Please refresh the page.";
    }
    
    // RLS (Row Level Security) errors
    if (message.includes("row-level security") || message.includes("policy") || message.includes("permission")) {
      return "Permission denied. Please check database policies.";
    }
    
    // Missing environment variables
    if (message.includes("missing") && message.includes("env")) {
      return "Configuration error. Please contact support.";
    }
    
    // Table not found
    if (message.includes("relation") || message.includes("does not exist") || message.includes("table")) {
      return "Database error. Tables may not be initialized. Please run migrations.";
    }
    
    // Return sanitized error message (first 100 chars) in production
    return `${defaultMessage} (${error.message.substring(0, 100)})`;
  }
  
  return defaultMessage;
}
