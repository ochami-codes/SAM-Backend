import crypto from "node:crypto";

import { UserModel } from "../../models/User.ts";
import { RefreshSessionModel } from "../../models/refreshSession.ts";

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

  // Hash the incoming refresh token
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  // Find the session belonging to this refresh token
  const session = await RefreshSessionModel.findOne({
    sessionId: payload.sessionId,
    tokenHash,
  });

  if (!session) {
    throw new AppError(
      "Invalid or revoked refresh token",
      401,
      "INVALID_REFRESH_TOKEN"
    );
  }

  // Make sure the session itself has not expired
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
    throw new AppError(
      "Account is inactive",
      403,
      "ACCOUNT_INACTIVE"
    );
  }

  // Create a new refresh token for the same session
  const newRefreshToken = createRefreshToken({
    userId: user._id.toString(),
    sessionId: session.sessionId,
  });

  // Hash the new refresh token
  const newTokenHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  // Replace the old refresh token with the new one
  session.tokenHash = newTokenHash;

  await session.save();

  // Create a new access token
  const accessToken = createAccessToken({
    userId: user._id.toString(),
    role: user.role,
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
}