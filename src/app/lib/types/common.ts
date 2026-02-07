/**
 * Common TypeScript advanced types
 */

// Branded types for type safety
export type UUID = string & { readonly __brand: unique symbol };
export type DateString = string & { readonly __brand: unique symbol };

/**
 * Type guard for UUID
 */
export function isUUID(value: string): value is UUID {
  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return UUID_REGEX.test(value);
}

/**
 * Type guard for date string (YYYY-MM-DD)
 */
export function isDateString(value: string): value is DateString {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) return false;

  const date = new Date(value);
  return (
    date instanceof Date &&
    !isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

/**
 * Type assertion function for UUID
 * Throws error if value is not a valid UUID
 */
export function assertUUID(value: string): UUID {
  if (!isUUID(value)) {
    throw new Error(`Invalid UUID: ${value}`);
  }
  return value as UUID;
}

/**
 * Type assertion function for DateString
 * Throws error if value is not a valid date string
 */
export function assertDateString(value: string): DateString {
  if (!isDateString(value)) {
    throw new Error(`Invalid date string: ${value}`);
  }
  return value as DateString;
}
