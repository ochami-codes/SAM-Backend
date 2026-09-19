import { validateEmail } from "./email.ts";
import { validateString } from "./string.ts";

export function validateContactName(
  value: unknown
): string {
  return validateString(value, "Name", {
    minLength: 2,
    maxLength: 100,
  });
}

export function validateContactSubject(
  value: unknown
): string {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "";
  }

  return validateString(value, "Subject", {
    maxLength: 200,
  });
}

export function validateContactMessage(
  value: unknown
): string {
  return validateString(value, "Message", {
    minLength: 1,
    maxLength: 5000,
  });
}

export function validateContactEmail(
  value: unknown
): string {
  return validateEmail(value);
}