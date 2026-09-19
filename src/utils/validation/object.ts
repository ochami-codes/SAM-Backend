import { AppError } from "../../errors/AppError.ts";

export function isObject(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function validateObject(
  value: unknown,
  fieldName = "body"
): Record<string, unknown> {
  if (!isObject(value)) {
    throw new AppError(
      `${fieldName} must be an object`,
      400,
      "VALIDATION_ERROR"
    );
  }

  return value;
}