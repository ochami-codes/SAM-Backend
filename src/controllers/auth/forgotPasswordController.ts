import { AppError } from "../../errors/AppError.ts";
import { changeForgottenPassword } from "../../services/auth/forgotPassword.ts";
import type { Request, Response } from "express";
export async function forgotPassword(
  req: Request,
  res: Response
): Promise<void> {
  const { token, newPassword } = req.body;

  if (!token) {
    throw new AppError(
      "Token is required",
      400,
      "VALIDATION_ERROR"
    );
  }

  if (!newPassword) {
    throw new AppError(
      "New password is required",
      400,
      "VALIDATION_ERROR"
    );
  }

  await changeForgottenPassword({ token, newPassword });

  res.status(200).json({
    success: true,
    message:
      "If an account exists for that email, password reset instructions have been sent.",
  });
}