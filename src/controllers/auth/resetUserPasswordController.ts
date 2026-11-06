import { AppError } from "../../errors/AppError.ts";
import { resetPassword } from "../../services/auth/resetPasswordService.ts";
import type { Request, Response } from "express";
export async function resetUserPassword(
  req: Request,
  res: Response
): Promise<void> {
  const { token, password } = req.body;
  console.log("Reset token:", token);
  if (!token || !password) {
    throw new AppError(
      "Reset token and new password are required",
      400,
      "VALIDATION_ERROR"
    );
  }

  await resetPassword({
    token,
    password,
  });

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
}