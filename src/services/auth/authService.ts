import crypto from "node:crypto";

import { UserModel } from "../../models/User.ts";
import { RefreshSessionModel } from "../../models/refreshSession.ts";
import { verifyPassword } from "../../utils/password.ts";
import { validateEmail, validatePassword } from "../../utils/validation/index.ts";
import { createAccessToken, createRefreshToken } from "../../utils/tokens.ts";
import { AppError } from "../../errors/AppError.ts";
import { createAuditLog } from "../audit/auditCreationService.ts";
import { AUDIT_ACTIONS } from "../../constants/auditActions.ts";

interface LoginInput {
  email: string;
  password: string;
}

interface LoginAuditContext {
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

export async function loginUser(
  { email, password }: LoginInput,
  auditContext: LoginAuditContext = {}
) {
  const normalizedEmail = validateEmail(email);
  const validatedPassword = validatePassword(password);

  const user = await UserModel.findOne({ email: normalizedEmail });

  if (!user) {
    await createAuditLog({
      action: AUDIT_ACTIONS.LOGIN_FAILED,
      category: "authentication",
      description: "Login failed: account not found",
      metadata: {
        attemptedEmail: normalizedEmail,
        reason: "ACCOUNT_NOT_FOUND",
      },
      ipAddress: auditContext.ipAddress,
      userAgent: auditContext.userAgent,
    });

    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  if (!user.isActive) {
    await createAuditLog({
      action: AUDIT_ACTIONS.LOGIN_BLOCKED,
      category: "authentication",
      description: "Login blocked: inactive account",
      actor: {
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
      },
      metadata: { reason: "ACCOUNT_INACTIVE" },
      ipAddress: auditContext.ipAddress,
      userAgent: auditContext.userAgent,
    });

    throw new AppError("Account is inactive", 403, "ACCOUNT_INACTIVE");
  }

  const passwordValid = await verifyPassword(validatedPassword, user.passwordHash);

  if (!passwordValid) {
    await createAuditLog({
      action: AUDIT_ACTIONS.LOGIN_FAILED,
      category: "authentication",
      description: "Login failed: incorrect password",
      actor: {
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
      },
      metadata: { reason: "INVALID_PASSWORD" },
      ipAddress: auditContext.ipAddress,
      userAgent: auditContext.userAgent,
    });

    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  const userId = user._id.toString();
  const sessionId = crypto.randomUUID();

  const accessToken = createAccessToken({ userId, role: user.role });
  const refreshToken = createRefreshToken({ userId, sessionId });

  const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

  await RefreshSessionModel.create({
    sessionId,
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  await createAuditLog({
    action: AUDIT_ACTIONS.LOGIN_SUCCESS,
    category: "authentication",
    description: "Administrator logged in successfully",
    actor: {
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
    },
    metadata: { role: user.role, sessionId },
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });

  return {
    user: {
      id: userId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
    accessToken,
    refreshToken,
  };
}
                          