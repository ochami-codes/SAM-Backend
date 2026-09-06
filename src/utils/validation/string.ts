import { AppError } from "../../errors/AppError.ts";

export function isString(
  value: unknown
): value is string {
  return typeof value === "string";
}

export function isNonEmptyString(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

export function validateString(
  value: unknown,
  fieldName: string,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    trim?: boolean;
  } = {}
): string {
  const {
    required = true,
    minLength,
    maxLength,
    trim = true,
  } = options;

  if (value === undefined || value === null) {
    if (!required) {
      return "";
    }

    throw new AppError(
      `${fieldName} is required`,
      400,
      "VALIDATION_ERROR"
    );
  }

  if (typeof value !== "string") {
    throw new AppError(
      `${fieldName} must be a string`,
      400,
      "VALIDATION_ERROR"
    );
  }

  const result = trim ? value.trim() : value;

  if (required && result.length === 0) {
    throw new AppError(
      `${fieldName} is required`,
      400,
      "VALIDATION_ERROR"
    );
  }

  if (
    minLength !== undefined &&
    result.length < minLength
  ) {
    throw new AppError(
      `${fieldName} must be at least ${minLength} characters long`,
      400,
      "VALIDATION_ERROR"
    );
  }

  if (
    maxLength !== undefined &&
    result.length > maxLength
  ) {
    throw new AppError(
      `${fieldName} must not exceed ${maxLength} characters`,
      400,
      "VALIDATION_ERROR"
    );
  }

  return result;
}

export function validatePattern(
  value: string,
  pattern: RegExp,
  fieldName: string,
  message: string
): string {
  if (!pattern.test(value)) {
    throw new AppError(
      message,
      400,
      "VALIDATION_ERROR"
    );
  }

  return value;
}