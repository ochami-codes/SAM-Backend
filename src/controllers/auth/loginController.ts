import type { Response } from "express";

import { loginUser } from "../../services/auth/authService.ts";

import { getClientIp } from "../../utils/getClientIp.ts";
import type { AuthenticatedRequest } from "../../middleware/authenticate.ts";
import { AppError } from "../../errors/AppError.ts";

const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export async function login(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { email, password } = req.body;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    throw new AppError(
      "Email and password are required",
      400,
      "VALIDATION_ERROR"
    );
  }

const result = await loginUser(
{
email,
password,
},
{
ipAddress: getClientIp(req),
userAgent: req.get("user-agent") ?? undefined,
}
);
// Case 1: Global 2FA enforcement requires enrollment.
  if ("requiresTwoFactorEnrollment" in result) {
    res.status(200).json({
      success: true,
      message: "Two-factor authentication enrollment is required",
      requiresTwoFactorEnrollment: true,
      user: result.user,
      accessToken: result.accessToken,
    });

    return;
  }

  // Case 2: Administrator must verify an authenticator code.
  if ("requiresTwoFactor" in result) {
    res.status(200).json({
      success: true,
      message: "Two-factor authentication required",
      requiresTwoFactor: true,
      challengeToken: result.challengeToken,
      expiresAt: result.expiresAt,
      user: result.user,
    });

    return;
  }

  // Case 3: Normal authenticated login.
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    user: result.user,
    accessToken: result.accessToken,
  });
}