import crypto from "node:crypto";

import { UserModel } from "../../models/User.ts";
import { PasswordResetTokenModel } from "../../models/PasswordResetToken.ts";
import { RefreshSessionModel } from "../../models/refreshSession.ts";
import { hashPassword } from "../../utils/password.ts";
import { AppError } from "../../errors/AppError.ts";
import { createAuditLog } from "../../services/audit/auditCreationService.ts";
import { AUDIT_ACTIONS } from "../../constants/auditActions.ts";

interface ChangeForgottenPasswordInput {
  token: string;
  newPassword: string;
}

interface PasswordAuditContext {
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

export async function changeForgottenPassword(
  { token, newPassword }: ChangeForgottenPasswordInput,
  auditContext: PasswordAuditContext = {}
): Promise<void> {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // 1. Find token in new collection, not on User
  const resetRecord = await PasswordResetTokenModel.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  });

  if (!resetRecord) {
    throw new AppError(
      "Invalid or expired password reset token",
      400,
      "INVALID_RESET_TOKEN"
    );
  }

  const user = await UserModel.findById(resetRecord.userId);

  if (!user) {
    // cleanup orphaned token
    await PasswordResetTokenModel.deleteOne({ _id: resetRecord._id });
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  // 2. Hash new password
  const passwordHash = await hashPassword(newPassword);

  user.passwordHash = passwordHash;
  user.mustChangePassword = false;
  await user.save();

  // 3. Invalidate this reset token so it can't be reused
  await PasswordResetTokenModel.deleteOne({ _id: resetRecord._id });

  // 4. Optional: delete ALL reset tokens for user + revoke refresh sessions
  await PasswordResetTokenModel.deleteMany({ userId: user._id });
  
  const revokedSessions = await RefreshSessionModel.deleteMany({
    userId: user._id,
  });

  await createAuditLog({
    actor: {
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
    },
    action: AUDIT_ACTIONS.PASSWORD_RESET,
    category: "authentication",
    resource: {
      type: "user",
      id: user._id.toString(),
    },
    description: "User successfully reset their password",
    metadata: {
      revokedSessions: revokedSessions.deletedCount,
    },
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });
}