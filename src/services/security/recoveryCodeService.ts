import crypto from "node:crypto";
import { Types } from "mongoose";

import { UserModel } from "../../models/User.ts";

const RECOVERY_CODE_COUNT = 10;
const RECOVERY_CODE_BYTES = 12;

/**
 * Normalizes a recovery code before hashing.
 */
function normalizeRecoveryCode(code: string): string {
  return code
    .replace(/[\s-]/g, "")
    .toUpperCase();
}

/**
 * Hashes a recovery code using SHA-256.
 *
 * Recovery codes have high cryptographic entropy,
 * so a fast cryptographic hash is appropriate.
 */
export function hashRecoveryCode(code: string): string {
  return crypto
    .createHash("sha256")
    .update(normalizeRecoveryCode(code))
    .digest("hex");
}

/**
 * Generates cryptographically secure recovery codes.
 *
 * Returns plaintext codes for one-time display
 * and their hashes for database storage.
 */
export function generateRecoveryCodes(): {
  codes: string[];
  hashes: string[];
} {
  const codes = Array.from(
    { length: RECOVERY_CODE_COUNT },
    () => {
      const randomBytes = crypto.randomBytes(
        RECOVERY_CODE_BYTES
      );

      const hexadecimal = randomBytes.toString("hex");

      return hexadecimal
        .match(/.{1,4}/g)!
        .join("-");
    }
  );

  const hashes = codes.map(hashRecoveryCode);

  return {
    codes,
    hashes,
  };
}

/**
 * Atomically verifies and consumes a recovery code.
 *
 * The database operation ensures that concurrent requests
 * cannot successfully reuse the same recovery code.
 */
export async function consumeRecoveryCode(
  userId: string | Types.ObjectId,
  code: string
): Promise<boolean> {
  const normalizedCode = normalizeRecoveryCode(code);

  // Reject malformed input before querying MongoDB.
  if (!/^[A-F0-9]{24}$/.test(normalizedCode)) {
    return false;
  }

  const codeHash = hashRecoveryCode(normalizedCode);

  const result = await UserModel.updateOne(
    {
      _id: userId,
      twoFactorEnabled: true,
      recoveryCodeHashes: codeHash,
    },
    {
      $pull: {
        recoveryCodeHashes: codeHash,
      },
    }
  );

  return result.modifiedCount === 1;
}