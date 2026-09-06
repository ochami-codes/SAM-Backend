import { AppError } from "../../errors/AppError.ts";
import { validateString } from "./string.ts";

const MAX_EMAIL_LENGTH = 254;

/*
 * Practical email validation.
 *
 * This intentionally isn't an enormous RFC regex.
 * The email provider ultimately determines whether
 * the address can receive mail.
 */
const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(
  email: string
): string {
  return email.trim().toLowerCase();
}

export function validateEmail(
  value: unknown
): string {
  const email = validateString(
    value,
    "Email address",
    {
      maxLength: MAX_EMAIL_LENGTH,
    }
  );

  const normalizedEmail = normalizeEmail(email);

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    throw new AppError(
      "Please provide a valid email address",
      400,
      "VALIDATION_ERROR"
    );
  }

  return normalizedEmail;
}

export function isValidEmail(
  value: unknown
): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const email = normalizeEmail(value);

  if (
    email.length === 0 ||
    email.length > MAX_EMAIL_LENGTH
  ) {
    return false;
  }

  return EMAIL_PATTERN.test(email);
}