import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../middleware/authenticate.ts";

import { AppError } from "../errors/AppError.ts";

import {
  startTwoFactorSetup,
  verifyAndEnableTwoFactor,
} from "../services/security/twoFactorEnrollmentService.ts";

import { UserModel } from "../models/User.ts";
import { verifyTwoFactorChallenge } from "../services/security/twoFactorChallengeService.ts";
import { createAuthenticatedSession } from "../services/auth/authService.ts";

/**
 * Start two-factor authentication enrollment.
 */
export async function startTwoFactorSetupController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { password } = req.body;

  if (!password || typeof password !== "string") {
    throw new AppError(
      "Current password is required",
      400,
      "VALIDATION_ERROR"
    );
  }

  const result = await startTwoFactorSetup(
    req.user!.userId,
    password
  );

  res.status(200).json({
    success: true,
    message: "Two-factor enrollment initiated",
    data: {
      qrCode: result.qrCode,
      secret: result.secret,
      expiresAt: result.expiresAt,
    },
  });
}

/**
 * Verify the authenticator code and activate 2FA.
 */
export async function verifyTwoFactorSetupController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { token } = req.body;

  if (
    !token ||
    typeof token !== "string" ||
    !/^\d{6}$/.test(token)
  ) {
    throw new AppError(
      "A valid six-digit authenticator code is required",
      400,
      "VALIDATION_ERROR"
    );
  }

  const result = await verifyAndEnableTwoFactor(
    req.user!.userId,
    token
  );

  res.status(200).json({
    success: true,
    message: "Two-factor authentication enabled successfully",
    data: {
      enabled: result.enabled,
      enabledAt: result.enabledAt,
      recoveryCodes: result.recoveryCodes,
    },
  });
}

/**
 * Retrieve the current administrator's 2FA status.
 */
export async function getTwoFactorStatusController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const user = await UserModel.findById(
    req.user!.userId
  ).select(
    "twoFactorEnabled twoFactorEnabledAt"
  );

  if (!user) {
    throw new AppError(
      "User account not found",
      404,
      "USER_NOT_FOUND"
    );
  }

  res.status(200).json({
    success: true,
    data: {
      enabled: user.twoFactorEnabled,
      enabledAt: user.twoFactorEnabledAt,
    },
  });
}
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export async function verifyTwoFactorLoginController(
  req: Request,
  res: Response
) {
  const { challengeToken, code } = req.body;

  if (
    typeof challengeToken !== "string" ||
    typeof code !== "string"
  ) {
    throw new AppError(
      "Challenge token and verification code are required.",
      400
    );
  }

  // Verify and consume the challenge.
  // The service returns the administrator only after successful verification.
  const user = await verifyTwoFactorChallenge(
    challengeToken,
    code
  );

  // Create the authenticated session only after 2FA succeeds.
  const result = await createAuthenticatedSession(user, {
    ipAddress: req.ip,
    userAgent: req.get("user-agent") ?? undefined,
    twoFactorVerified: true,
  });

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Authentication successful.",
    user: result.user,
    accessToken: result.accessToken,
  });
}