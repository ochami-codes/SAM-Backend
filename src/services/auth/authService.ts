import crypto from "node:crypto";

import { UserModel, type UserDocument } from "../../models/User.ts";
import { RefreshSessionModel } from "../../models/refreshSession.ts";
import { SecuritySettingsModel } from "../../models/SecuritySettings.ts";

import { verifyPassword } from "../../utils/password.ts";
import {
  validateEmail,
  validatePassword,
} from "../../utils/validation/index.ts";

import {
  createAccessToken,
  createRefreshToken,
} from "../../utils/tokens.ts";

import { AppError } from "../../errors/AppError.ts";

import { createAuditLog } from "../audit/auditCreationService.ts";
import { AUDIT_ACTIONS } from "../../constants/auditActions.ts";

import {
  createTwoFactorChallenge,
} from "../security/twoFactorChallengeService.ts";
import { getDeviceName } from "../../utils/getDeviceName.ts";

interface LoginInput {
  email: string;
  password: string;
}

interface LoginAuditContext {
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
  twoFactorVerified?: boolean | undefined;
}

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

function getUserResponse(user: UserDocument) {
  if (!user) {
    throw new AppError(
      "User account not found",
      404,
      "USER_NOT_FOUND"
    );
  }

  return {
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  };
}

/**
 * Creates a fully authenticated session.
 *
 * This function must only be called after all required
 * authentication factors have been successfully verified.
 */
export async function createAuthenticatedSession(
  user: UserDocument,
  auditContext: LoginAuditContext = {}
) {
  const userId = user._id.toString();
  const sessionId = crypto.randomUUID();

  const accessToken = createAccessToken({
    userId,
    sessionId,
    role: user.role,
    authVersion: user.authVersion,
  });

  const refreshToken = createRefreshToken({
    userId,
    sessionId,
  });

  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await RefreshSessionModel.create({
    sessionId,
    userId: user._id,
    tokenHash,
    deviceName: getDeviceName(auditContext.userAgent),
    ipAddress: auditContext.ipAddress ?? null,
    userAgent: auditContext.userAgent ?? null,
    lastActiveAt: new Date(),
    expiresAt: new Date(
      Date.now() +
        REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    ),
  });

  return {
    user: getUserResponse(user),
    accessToken,
    refreshToken,
  };
}

/**
 * Authenticates an administrator using email and password.
 */
export async function loginUser(
  { email, password }: LoginInput,
  auditContext: LoginAuditContext = {}
) {
  const normalizedEmail = validateEmail(email);
  const validatedPassword = validatePassword(password);

  const user = await UserModel.findOne({
    email: normalizedEmail,
  });

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

    throw new AppError(
      "Invalid email or password",
      401,
      "INVALID_CREDENTIALS"
    );
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
      metadata: {
        reason: "ACCOUNT_INACTIVE",
      },
      ipAddress: auditContext.ipAddress,
      userAgent: auditContext.userAgent,
    });

    throw new AppError(
      "Account is inactive",
      403,
      "ACCOUNT_INACTIVE"
    );
  }

  const passwordValid = await verifyPassword(
    validatedPassword,
    user.passwordHash
  );

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
      metadata: {
        reason: "INVALID_PASSWORD",
      },
      ipAddress: auditContext.ipAddress,
      userAgent: auditContext.userAgent,
    });

    throw new AppError(
      "Invalid email or password",
      401,
      "INVALID_CREDENTIALS"
    );
  }

  // Retrieve global security policy.
  const securitySettings = await SecuritySettingsModel.findOne({
    key: "global",
  }).select("requireTwoFactor");

  const requiresTwoFactor =
    securitySettings?.requireTwoFactor ?? false;

  // Case 1: Global enforcement is active, but the administrator
  // has not enrolled. Allow access only to enrollment endpoints.
  if (requiresTwoFactor && !user.twoFactorEnabled) {
    const enrollmentToken = createAccessToken({
      userId: user._id.toString(),
      role: user.role,
      authVersion: user.authVersion,
      tokenPurpose: "two_factor_enrollment",
    });

    return {
      requiresTwoFactorEnrollment: true as const,
      accessToken: enrollmentToken,
      user: getUserResponse(user),
    };
  }

  // Case 2: The administrator has enabled 2FA.
  // Do not create a session until the second factor is verified.
  if (user.twoFactorEnabled) {
    const challenge = await createTwoFactorChallenge(user._id.toString());

    return {
      requiresTwoFactor: true as const,
      challengeToken: challenge.challengeToken,
      expiresAt: challenge.expiresAt,
      user: getUserResponse(user),
    };
  }

  // Case 3: No 2FA requirement. Complete normal login.
  return createAuthenticatedSession(user, auditContext);
}                         