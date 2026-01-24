/**
 * Security validation utilities
 */

import type { UUID, DateString } from "../types/common";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates UUID format
 */
export function isValidUUID(value: string | null | undefined): value is UUID {
  if (!value) return false;
  return UUID_REGEX.test(value);
}

/**
 * Validates date format (YYYY-MM-DD)
 */
export function isValidDate(dateString: string): dateString is DateString {
  if (!dateString || typeof dateString !== "string") return false;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  const date = new Date(dateString);
  return (
    date instanceof Date &&
    !isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === dateString
  );
}

/**
 * Sanitizes string input to prevent XSS
 * Removes potentially dangerous characters and limits length
 */
export function sanitizeString(
  input: string,
  maxLength: number = 200
): string {
  if (typeof input !== "string") {
    return "";
  }

  // Trim and limit length
  let sanitized = input.trim().slice(0, maxLength);

  // Remove potentially dangerous characters but allow normal text
  // Allow: letters, numbers, spaces, common punctuation
  sanitized = sanitized.replace(/[<>]/g, "");

  return sanitized;
}

/**
 * Validates numeric value
 */
export function isValidNumber(
  value: unknown,
  min: number = 0,
  max: number = Number.MAX_SAFE_INTEGER
): boolean {
  const num = Number(value);
  return (
    Number.isFinite(num) &&
    num >= min &&
    num <= max &&
    !Number.isNaN(num)
  );
}

/**
 * Validates array length
 */
export function isValidArrayLength<T>(
  array: T[],
  min: number = 0,
  max: number = 1000
): boolean {
  return Array.isArray(array) && array.length >= min && array.length <= max;
}
