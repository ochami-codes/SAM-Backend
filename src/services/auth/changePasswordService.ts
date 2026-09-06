import { UserModel } from "../../models/User.ts";
import { RefreshSessionModel } from "../../models/refreshSession.ts";
import { hashPassword, verifyPassword } from "../../utils/password.ts";
import { AppError } from "../../errors/AppError.ts";

interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export async function changePassword({
  userId,
  currentPassword,
  newPassword,
}: ChangePasswordInput): Promise<void> {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError(
      "User not found",
      404,
      "USER_NOT_FOUND"
    );
  }

  const passwordValid = await verifyPassword(
    currentPassword,
    user.passwordHash
  );

  if (!passwordValid) {
    throw new AppError(
      "Current password is incorrect",
      400,
      "INVALID_CURRENT_PASSWORD"
    );
  }

  if (currentPassword === newPassword) {
    throw new AppError(
      "New password must be different from the current password",
      400,
      "PASSWORD_UNCHANGED"
    );
  }

  const passwordHash = await hashPassword(newPassword);

  user.passwordHash = passwordHash;
  user.mustChangePassword = false;

  await user.save();
    // Invalidate all existing refresh tokens for the user
    await RefreshSessionModel.deleteMany({ userId: user._id });
}