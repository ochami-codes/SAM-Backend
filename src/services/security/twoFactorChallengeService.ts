import crypto from "node:crypto";

import { TwoFactorChallengeModel } from "../../models/TwoFactorChallenge.ts";
import { UserModel, type UserDocument } from "../../models/User.ts";

import { AppError } from "../../errors/AppError.ts";

import {
  decryptTwoFactorSecret,
  verifyTotpCode,
} from "./twoFactorService.ts";

import {
  consumeRecoveryCode,
} from "./recoveryCodeService.ts";

const CHALLENGE_EXPIRY_MINUTES = 5;
const MAX_CHALLENGE_ATTEMPTS = 5;
const CHALLENGE_TOKEN_BYTES = 32;

interface CreatedChallenge {
  challengeToken: string;
  expiresAt: Date;
}

/**
 * Creates a short-lived login challenge for an administrator
 * who has successfully entered their email and password.
 */
export async function createTwoFactorChallenge(
  userId: string
): Promise<CreatedChallenge> {
  const user = await UserModel.findById(userId)
    .select("_id isActive twoFactorEnabled")
    .lean();

  if (!user || !user.isActive || !user.twoFactorEnabled) {
    throw new AppError(
      "Two-factor authentication is unavailable.",
      403
    );
  }

  // Generate a cryptographically secure challenge token.
  const challengeToken = crypto
    .randomBytes(CHALLENGE_TOKEN_BYTES)
    .toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(challengeToken)
    .digest("hex");

  const expiresAt = new Date(
    Date.now() + CHALLENGE_EXPIRY_MINUTES * 60 * 1000
  );

  // Invalidate previous outstanding login challenges.
  await TwoFactorChallengeModel.deleteMany({
    userId: user._id,
    consumedAt: null,
  });

  await TwoFactorChallengeModel.create({
    userId: user._id,
    tokenHash,
    expiresAt,
    attempts: 0,
    consumedAt: null,
  });

  return {
    challengeToken,
    expiresAt,
  };
}

/**
 * Verifies a login challenge using either:
 * - A six-digit authenticator code.
 * - A one-time recovery code.
 *
 * Returns the administrator only after successful verification.
 */
export async function verifyTwoFactorChallenge(
  challengeToken: string,
  code: string
): Promise<UserDocument> {
  if (
    typeof challengeToken !== "string" ||
    !/^[a-f0-9]{64}$/i.test(challengeToken)
  ) {
    throw new AppError(
      "Invalid or expired authentication challenge.",
      401
    );
  }

  if (typeof code !== "string" || !code.trim()) {
    throw new AppError(
      "A verification code is required.",
      400
    );
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(challengeToken)
    .digest("hex");

  const challenge = await TwoFactorChallengeModel.findOne({
    tokenHash,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: MAX_CHALLENGE_ATTEMPTS },
  }).select("+tokenHash");

  if (!challenge) {
    throw new AppError(
      "Invalid or expired authentication challenge.",
      401
    );
  }

  const user = await UserModel.findOne({
    _id: challenge.userId,
    isActive: true,
    twoFactorEnabled: true,
  }).select("+twoFactorSecretEncrypted +recoveryCodeHashes");

  if (!user) {
    throw new AppError(
      "Two-factor authentication is unavailable.",
      401
    );
  }

  let verified = false;

  // Authenticator codes contain exactly six digits.
  if (/^\d{6}$/.test(code)) {
    if (!user.twoFactorSecretEncrypted) {
      throw new AppError(
        "Two-factor authentication is not configured correctly.",
        500
      );
    }

    const secret = decryptTwoFactorSecret(
      user.twoFactorSecretEncrypted
    );

    verified = await verifyTotpCode(secret, code);
  } else {
    // Non-six-digit input is treated as a recovery code.
    verified = await consumeRecoveryCode(
      user._id.toString(),
      code
    );
  }

  if (!verified) {
    // Increment attempts atomically.
    await TwoFactorChallengeModel.updateOne(
      {
        _id: challenge._id,
        consumedAt: null,
        expiresAt: { $gt: new Date() },
        attempts: { $lt: MAX_CHALLENGE_ATTEMPTS },
      },
      {
        $inc: { attempts: 1 },
      }
    );

    throw new AppError(
      "Invalid verification code.",
      401
    );
  }

  // Atomically consume the challenge.
  // Only one request can successfully complete authentication.
  const consumedChallenge =
    await TwoFactorChallengeModel.findOneAndUpdate(
      {
        _id: challenge._id,
        tokenHash,
        consumedAt: null,
        expiresAt: { $gt: new Date() },
        attempts: { $lt: MAX_CHALLENGE_ATTEMPTS },
      },
      {
        $set: {
          consumedAt: new Date(),
        },
      },
      {
        new: true,
      }
    );

  if (!consumedChallenge) {
    throw new AppError(
      "Authentication challenge has expired or already been used.",
      401
    );
  }

  return user;
}