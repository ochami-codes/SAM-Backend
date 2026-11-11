import crypto from "node:crypto";

import { UserModel } from "../../models/User.ts";
import { RefreshSessionModel } from "../../models/refreshSession.ts";
import { SecuritySettingsModel } from "../../models/SecuritySettings.ts";

import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../../utils/tokens.ts";

import { AppError } from "../../errors/AppError.ts";

export async function refreshAccessToken(
  refreshToken: string
): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(
      "Invalid or expired refresh token",
      401,
      "INVALID_REFRESH_TOKEN"
    );
  }

  // Hash the incoming refresh token.
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  // Find the session belonging to this refresh token.
  const session = await RefreshSessionModel.findOne({
  sessionId: payload.sessionId,
  userId: payload.userId,
  tokenHash,
}).select("+tokenHash");

  if (!session) {
    throw new AppError(
      "Invalid or revoked refresh token",
      401,
      "INVALID_REFRESH_TOKEN"
    );
  }

  // Make sure the session itself has not expired.
  if (session.expiresAt <= new Date()) {
    await RefreshSessionModel.deleteOne({
      _id: session._id,
    });

    throw new AppError(
      "Invalid or expired refresh token",
      401,
      "INVALID_REFRESH_TOKEN"
    );
  }

  const user = await UserModel.findById(payload.userId);

  if (!user) {
    throw new AppError(
      "Invalid refresh token",
      401,
      "INVALID_REFRESH_TOKEN"
    );
  }

  if (!user.isActive) {
    await RefreshSessionModel.deleteOne({
      _id: session._id,
    });

    throw new AppError(
      "Account is inactive",
      403,
      "ACCOUNT_INACTIVE"
    );
  }

  // Check the global security policy.
  const securitySettings = await SecuritySettingsModel.findOne({
    key: "global",
  }).select("requireTwoFactor");

  const requiresTwoFactor =
    securitySettings?.requireTwoFactor ?? false;

  // Prevent unenrolled administrators from refreshing sessions
  // when global 2FA enforcement is active.
  if (requiresTwoFactor && !user.twoFactorEnabled) {
    await RefreshSessionModel.deleteOne({
      _id: session._id,
    });

    throw new AppError(
      "Two-factor authentication enrollment is required. Please log in and complete enrollment.",
      403,
      "TWO_FACTOR_ENROLLMENT_REQUIRED"
    );
  }

  // Create a new refresh token for the same session.
  const newRefreshToken = createRefreshToken({
    userId: user._id.toString(),
    sessionId: session.sessionId,
  });

  // Hash the new refresh token.
  const newTokenHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  // Replace the old refresh token with the new one.
session.tokenHash = newTokenHash;
session.lastActiveAt = new Date();

await session.save();

  // Create a new access token.
  const accessToken = createAccessToken({
  userId: user._id.toString(),
  sessionId: session.sessionId,
  role: user.role,
  authVersion: user.authVersion,
});

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
}