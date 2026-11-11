import type { Request, Response, NextFunction } from "express";
import { RefreshSessionModel } from "../models/refreshSession.ts";
import { UserModel } from "../models/User.ts";
import { SecuritySettingsModel } from "../models/SecuritySettings.ts";
import { verifyAccessToken } from "../utils/tokens.ts";
import { AppError } from "../errors/AppError.ts";

export interface AuthenticatedUser {
  userId: string;
  sessionId: string;
  role: "admin" | "super_admin";
  fullName?: string | undefined;
  email?: string | undefined;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

async function authenticateRequest(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
  allowUnenrolledTwoFactor = false
): Promise<void> {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return next(
      new AppError("Authentication required", 401, "AUTHENTICATION_REQUIRED")
    );
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(
      new AppError("Invalid authorization header", 401, "INVALID_AUTHORIZATION")
    );
  }

  try {
    const payload = verifyAccessToken(token);

    if (!allowUnenrolledTwoFactor && payload.tokenPurpose !== "access") {
      return next(
        new AppError(
          "This token cannot access protected resources.",
          403,
          "INVALID_TOKEN_PURPOSE"
        )
      );
    }

    const user = await UserModel.findById(payload.userId).select(
      "_id role isActive fullName email authVersion twoFactorEnabled"
    );

    if (!user) {
      return next(new AppError("User account not found", 401, "USER_NOT_FOUND"));
    }

    if (!user.isActive) {
      return next(new AppError("Account is inactive", 403, "ACCOUNT_INACTIVE"));
    }

    // Reject access tokens issued before a security-sensitive change.
    if (payload.authVersion !== user.authVersion) {
      return next(
        new AppError(
          "Your session is no longer valid. Please log in again.",
          401,
          "SESSION_INVALIDATED"
        )
      );
    }
// Ensure the authenticated session has not been revoked or expired.
// Enrollment tokens are exempt because they do not create refresh sessions.
if (payload.tokenPurpose === "access") {
  const session = await RefreshSessionModel.findOne({
    sessionId: payload.sessionId,
    userId: user._id,
    expiresAt: { $gt: new Date() },
  }).select("_id");

  if (!session) {
    return next(
      new AppError(
        "Your session has been revoked or expired. Please log in again.",
        401,
        "SESSION_REVOKED"
      )
    );
  }
}
    // Check the global security policy.
    const securitySettings = await SecuritySettingsModel.findOne({
      key: "global",
    }).select("requireTwoFactor");

    const requiresTwoFactor = securitySettings?.requireTwoFactor ?? false;

    if (
      allowUnenrolledTwoFactor &&
      payload.tokenPurpose === "two_factor_enrollment" &&
      (!requiresTwoFactor || user.twoFactorEnabled)
    ) {
      return next(
        new AppError(
          "This enrollment token is no longer valid.",
          403,
          "INVALID_ENROLLMENT_TOKEN"
        )
      );
    }

    // Administrators must enroll before accessing protected resources.
    // The enrollment middleware is the only exception.
    if (
      requiresTwoFactor &&
      !user.twoFactorEnabled &&
      !allowUnenrolledTwoFactor
    ) {
      return next(
        new AppError(
          "Two-factor authentication enrollment is required before accessing this resource.",
          403,
          "TWO_FACTOR_ENROLLMENT_REQUIRED"
        )
      );
    }

  req.user = {
  userId: user._id.toString(),
  sessionId: payload.sessionId,
  role: user.role,
  fullName: user.fullName,
  email: user.email,
};

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    return next(
      new AppError("Invalid or expired access token", 401, "INVALID_ACCESS_TOKEN")
    );
  }
}

// Standard authentication middleware.
export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  return authenticateRequest(req, res, next);
}

// Allows authenticated administrators to access only the
// 2FA enrollment routes when global enforcement is active.
export async function authenticateForTwoFactorEnrollment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  return authenticateRequest(req, res, next, true);
}