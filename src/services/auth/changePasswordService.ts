import { UserModel } from "../../models/User.ts";
import { RefreshSessionModel } from "../../models/refreshSession.ts";
import { SecuritySettingsModel } from "../../models/SecuritySettings.ts";

import {
  hashPassword,
  verifyPassword,
} from "../../utils/password.ts";

import { AppError } from "../../errors/AppError.ts";

import { createAuditLog } from "../../services/audit/auditCreationService.ts";
import { AUDIT_ACTIONS } from "../../constants/auditActions.ts";

interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

interface PasswordAuditContext {
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
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
    throw new AppError(
      "User not found",
      404,
      "USER_NOT_FOUND"
    );
  }

  // Verify current password.
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

  // Prevent password reuse.
  if (currentPassword === newPassword) {
    throw new AppError(
      "New password must be different from the current password",
      400,
      "PASSWORD_UNCHANGED"
    );
  }

  // Validate password length against global policy.
  const securitySettings =
    await SecuritySettingsModel.findOne({
      key: "global",
    }).lean();

  const minLength =
    securitySettings?.minimumPasswordLength ?? 8;

  const maxLength =
    securitySettings?.maximumPasswordLength ?? 128;

  if (
    typeof newPassword !== "string" ||
    newPassword.length < minLength ||
    newPassword.length > maxLength
  ) {
    throw new AppError(
      `Password must contain between ${minLength} and ${maxLength} characters`,
      400,
      "PASSWORD_POLICY_VIOLATION"
    );
  }

  // Hash the new password.
  const passwordHash = await hashPassword(newPassword);

  user.passwordHash = passwordHash;
  user.mustChangePassword = false;

  // Invalidate existing access tokens.
  user.authVersion += 1;

  await user.save();

  // Revoke all refresh sessions belonging to this user.
  const revokedSessions = await RefreshSessionModel.deleteMany({
    userId: user._id,
  });

  // Record the security event.
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