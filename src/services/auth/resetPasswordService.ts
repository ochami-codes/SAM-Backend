import crypto from "node:crypto";

import { UserModel } from "../../models/User.ts";
import { PasswordResetTokenModel } from "../../models/PasswordResetToken.ts";
import { RefreshSessionModel } from "../../models/refreshSession.ts";
import { hashPassword } from "../../utils/password.ts";
import { AppError } from "../../errors/AppError.ts";

interface ResetPasswordInput {
  token: string;
  password: string;
}

export async function resetPassword({
  token,
  password,
}: ResetPasswordInput): Promise<void> {
  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const resetToken = await PasswordResetTokenModel.findOne({
    tokenHash,
  });

  if (!resetToken) {
    throw new AppError(
      "Invalid or expired password reset token",
      400,
      "INVALID_RESET_TOKEN"
    );
  }

  if (resetToken.expiresAt <= new Date()) {
    await PasswordResetTokenModel.deleteOne({
      _id: resetToken._id,
    });

    throw new AppError(
      "Invalid or expired password reset token",
      400,
      "INVALID_RESET_TOKEN"
    );
  }

  const user = await UserModel.findById(resetToken.userId);

  if (!user) {
    throw new AppError(
      "Invalid password reset request",
      400,
      "INVALID_RESET_TOKEN"
    );
  }

  const passwordHash = await hashPassword(password);

  user.passwordHash = passwordHash;
  user.mustChangePassword = false;

  await user.save();

  // Make the reset token single-use.
  await PasswordResetTokenModel.deleteOne({
    _id: resetToken._id,
  });
  // Invalidate all existing refresh tokens for the user
  await RefreshSessionModel.deleteMany({ userId: user._id });
}