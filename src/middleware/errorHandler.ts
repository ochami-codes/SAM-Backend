import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/AppError.ts";

export const errorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next
) => {
  console.error(error);

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.code && { code: error.code }),
    });

    return;
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};