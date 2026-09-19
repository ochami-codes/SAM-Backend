import mongoose from "mongoose";
import { AppError } from "../../errors/AppError.ts";

export function validateObjectId(
  value: unknown,
  fieldName: string
): string {
  if (
    typeof value !== "string" ||
    !mongoose.isValidObjectId(value)
  ) {
    throw new AppError(
      `${fieldName} is invalid`,
      400,
      "VALIDATION_ERROR"
    );
  }

  return value;
}

export function toObjectId(
  value: unknown,
  fieldName: string
): mongoose.Types.ObjectId {
  const validatedId = validateObjectId(
    value,
    fieldName
  );

  return new mongoose.Types.ObjectId(validatedId);
}