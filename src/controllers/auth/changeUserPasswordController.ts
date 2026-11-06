import { AppError } from "../../errors/AppError.ts";
import type { AuthenticatedRequest } from "../../middleware/authenticate.ts";
import type { Response } from "express";
import { changePassword } from "../../services/auth/changePasswordService.ts";

export async function changeUserPassword(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError(
      "Current password and new password are required",
      400,
      "VALIDATION_ERROR"
    );
  }

  await changePassword({
    userId: req.user!.userId,
    currentPassword,
    newPassword,
  });

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
}