import { UserModel } from "../../models/User.ts";
import { RefreshSessionModel } from "../../models/refreshSession.ts";
import { hashPassword, verifyPassword } from "../../utils/password.ts";
import { AppError } from "../../errors/AppError.ts";
import { createAuditLog } from "../../services/audit/auditCreationService.ts";
import { AUDIT_ACTIONS } from "../../constants/auditActions.ts";

interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

interface PasswordAuditContext {
  ipAddress?: string;
  userAgent?: string;
}

export async function changePassword(
  {
    userId,
    currentPassword,
    newPassword,
  }: ChangePasswordInput,
  auditContext: PasswordAuditContext = {}
): Promise<void> {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
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

  const revokedSessions = await RefreshSessionModel.deleteMany({
    userId: user._id,
  });

  await createAuditLog({
    actor: {
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
    },
    action: AUDIT_ACTIONS.PASSWORD_CHANGED,
    category: "authentication",
    resource: {
      type: "user",
      id: userId,
    },
    description: "User changed their password successfully",
    metadata: {
      revokedSessions: revokedSessions.deletedCount,
    },
    ...auditContext,
  });
}