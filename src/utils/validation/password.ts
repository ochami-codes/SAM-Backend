import { AppError } from "../../errors/AppError.ts";

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

/*
 * ASCII control characters:
 *
 * 0x00 - 0x1F
 * 0x7F
 *
 * These are not useful in normal passwords and can
 * cause problems when passwords are transported between
 * systems.
 */
const CONTROL_CHARACTER_PATTERN =
  /[\x00-\x1F\x7F]/;

export function validatePassword(
  value: unknown
): string {
  if (typeof value !== "string") {
    throw new AppError(
      "Password must be a string",
      400,
      "VALIDATION_ERROR"
    );
  }

  if (value.length < MIN_PASSWORD_LENGTH) {
    throw new AppError(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
      400,
      "VALIDATION_ERROR"
    );
  }

  if (value.length > MAX_PASSWORD_LENGTH) {
    throw new AppError(
      `Password must not exceed ${MAX_PASSWORD_LENGTH} characters`,
      400,
      "VALIDATION_ERROR"
    );
  }

  if (CONTROL_CHARACTER_PATTERN.test(value)) {
    throw new AppError(
      "Password contains invalid characters",
      400,
      "VALIDATION_ERROR"
    );
  }

  return value;
}

export function isValidPassword(
  value: unknown
): value is string {
  if (typeof value !== "string") {
    return false;
  }

  if (
    value.length < MIN_PASSWORD_LENGTH ||
    value.length > MAX_PASSWORD_LENGTH
  ) {
    return false;
  }

  return !CONTROL_CHARACTER_PATTERN.test(value);
}