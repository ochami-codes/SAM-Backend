import crypto from "node:crypto";

import { UserModel } from "../../models/User.ts";
import { RefreshSessionModel } from "../../models/refreshSession.ts";

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

interface LoginInput {
  email: string;
  password: string;
}

export async function loginUser({
  email,
  password,
}: LoginInput) {
  const normalizedEmail = validateEmail(email);
  const validatedPassword = validatePassword(password);

  const user = await UserModel.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    throw new AppError(
      "Invalid email or password",
      401,
      "INVALID_CREDENTIALS"
    );
  }

  if (!user.isActive) {
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
    throw new AppError(
      "Invalid email or password",
      401,
      "INVALID_CREDENTIALS"
    );
  }

  const userId = user._id.toString();

  // Create a unique ID for this login session
  const sessionId = crypto.randomUUID();

  // Create access token
  const accessToken = createAccessToken({
    userId,
    role: user.role,
  });

  // Create refresh token containing the session ID
  const refreshToken = createRefreshToken({
    userId,
    sessionId,
  });

  // Hash refresh token before storing it
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  // Store the refresh-token session
  await RefreshSessionModel.create({
    sessionId,
    userId: user._id,
    tokenHash,
    expiresAt: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ),
  });

  return {
    user: {
      id: userId,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
    accessToken,
    refreshToken,
  };
}