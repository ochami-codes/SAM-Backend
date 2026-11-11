import { UserModel } from "../../models/User.ts";

import { AppError } from "../../errors/AppError.ts";
import { verifyPassword } from "../../utils/password.ts";

import {
  generateTwoFactorSecret,
  generateOtpAuthUrl,
  generateTwoFactorQrCode,
  encryptTwoFactorSecret,
  decryptTwoFactorSecret,
  verifyTotpCode,
} from "./twoFactorService.ts";

import {
  generateRecoveryCodes,
} from "./recoveryCodeService.ts";

const ENROLLMENT_EXPIRY_MINUTES = 10;

/**
 * Starts two-factor authentication enrollment.
 *
 * Requires the administrator's current password
 * before generating an authenticator secret.
 */
export async function startTwoFactorSetup(
  userId: string,
  password: string
) {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError(
      "User account not found",
      404,
      "USER_NOT_FOUND"
    );
  }

  if (!user.isActive) {
    throw new AppError(
      "Account is inactive",
      403,
      "ACCOUNT_INACTIVE"
    );
  }

  if (user.twoFactorEnabled) {
    throw new AppError(
      "Two-factor authentication is already enabled",
      409,
      "TWO_FACTOR_ALREADY_ENABLED"
    );
  }

  const passwordValid = await verifyPassword(
    password,
    user.passwordHash
  );

  if (!passwordValid) {
    throw new AppError(
      "Incorrect password",
      401,
      "INVALID_PASSWORD"
    );
  }

  // Generate a unique authenticator secret.
  const secret = generateTwoFactorSecret();

  // Encrypt the secret before storing it.
  const encryptedSecret = encryptTwoFactorSecret(secret);

  // Create the authenticator provisioning URI.
  const otpAuthUrl = generateOtpAuthUrl(
    user.email,
    secret
  );

  // Generate the QR code.
  const qrCode = await generateTwoFactorQrCode(
    otpAuthUrl
  );

  const expiresAt = new Date(
    Date.now() + ENROLLMENT_EXPIRY_MINUTES * 60 * 1000
  );

  // Store the pending secret.
  await UserModel.updateOne(
    {
      _id: user._id,
      isActive: true,
      twoFactorEnabled: false,
    },
    {
      $set: {
        pendingTwoFactorSecretEncrypted: encryptedSecret,
        pendingTwoFactorSecretExpiresAt: expiresAt,
      },
    }
  );

  return {
    qrCode,
    secret,
    expiresAt,
  };
}

/**
 * Completes two-factor enrollment.
 *
 * The administrator must successfully verify
 * an authenticator code before 2FA is activated.
 */
export async function verifyAndEnableTwoFactor(
  userId: string,
  token: string
) {
  const user = await UserModel.findById(userId).select(
    "+pendingTwoFactorSecretEncrypted"
  );

  if (!user) {
    throw new AppError(
      "User account not found",
      404,
      "USER_NOT_FOUND"
    );
  }

  if (!user.isActive) {
    throw new AppError(
      "Account is inactive",
      403,
      "ACCOUNT_INACTIVE"
    );
  }

  if (user.twoFactorEnabled) {
    throw new AppError(
      "Two-factor authentication is already enabled",
      409,
      "TWO_FACTOR_ALREADY_ENABLED"
    );
  }

  const encryptedSecret =
    user.pendingTwoFactorSecretEncrypted;

  const expiresAt =
    user.pendingTwoFactorSecretExpiresAt;

  if (!encryptedSecret || !expiresAt) {
    throw new AppError(
      "No pending two-factor enrollment found",
      400,
      "TWO_FACTOR_SETUP_NOT_FOUND"
    );
  }

  if (expiresAt <= new Date()) {
    await UserModel.updateOne(
      {
        _id: user._id,
        twoFactorEnabled: false,
        pendingTwoFactorSecretEncrypted: encryptedSecret,
      },
      {
        $unset: {
          pendingTwoFactorSecretEncrypted: 1,
          pendingTwoFactorSecretExpiresAt: 1,
        },
      }
    );

    throw new AppError(
      "Enrollment has expired. Please start again.",
      400,
      "TWO_FACTOR_SETUP_EXPIRED"
    );
  }

  const secret = decryptTwoFactorSecret(
    encryptedSecret
  );

  const valid = await verifyTotpCode(
    secret,
    token
  );

  if (!valid) {
    throw new AppError(
      "Invalid authenticator code",
      401,
      "INVALID_TOTP_CODE"
    );
  }

  // Generate recovery codes only after successful verification.
  const { codes, hashes } = generateRecoveryCodes();

  const enabledAt = new Date();

  // Atomically activate 2FA and consume the pending enrollment.
  const result = await UserModel.updateOne(
    {
      _id: user._id,
      isActive: true,
      twoFactorEnabled: false,
      pendingTwoFactorSecretEncrypted: encryptedSecret,
      pendingTwoFactorSecretExpiresAt: {
        $gt: enabledAt,
      },
    },
    {
      $set: {
        twoFactorEnabled: true,
        twoFactorSecretEncrypted: encryptedSecret,
        recoveryCodeHashes: hashes,
        twoFactorEnabledAt: enabledAt,
      },
      $unset: {
        pendingTwoFactorSecretEncrypted: 1,
        pendingTwoFactorSecretExpiresAt: 1,
      },
      $inc: {
        authVersion: 1,
      },
    }
  );

  if (result.modifiedCount !== 1) {
    throw new AppError(
      "Enrollment could not be completed. Please try again.",
      409,
      "TWO_FACTOR_SETUP_CONFLICT"
    );
  }

  return {
    enabled: true,
    enabledAt,
    recoveryCodes: codes,
  };
}