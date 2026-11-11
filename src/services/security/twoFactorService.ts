import crypto from "node:crypto";

import {
  generateSecret,
  generateURI,
  verify,
} from "otplib";

import QRCode from "qrcode";

const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const ENCRYPTION_KEY_LENGTH = 32;
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

const TOTP_ISSUER =
  process.env.TWO_FACTOR_ISSUER ??
  "Second Advent Ministries";

/**
 * Retrieves and validates the dedicated encryption key.
 */
function getEncryptionKey(): Buffer {
  const key = process.env.TWO_FACTOR_ENCRYPTION_KEY;

  if (!key || !/^[a-fA-F0-9]{64}$/.test(key)) {
    throw new Error(
      "TWO_FACTOR_ENCRYPTION_KEY must be a valid 64-character hexadecimal key"
    );
  }

  const buffer = Buffer.from(key, "hex");

  if (buffer.length !== ENCRYPTION_KEY_LENGTH) {
    throw new Error("Invalid two-factor encryption key length");
  }

  return buffer;
}

/**
 * Generates a cryptographically secure TOTP secret.
 */
export function generateTwoFactorSecret(): string {
  return generateSecret();
}

/**
 * Generates an authenticator provisioning URI.
 */
export function generateOtpAuthUrl(
  email: string,
  secret: string
): string {
  return generateURI({
    issuer: TOTP_ISSUER,
    label: email,
    secret,
  });
}

/**
 * Generates a QR code as a base64 data URL.
 */
export async function generateTwoFactorQrCode(
  otpAuthUrl: string
): Promise<string> {
  return QRCode.toDataURL(otpAuthUrl, {
    errorCorrectionLevel: "M",
    type: "image/png",
    margin: 2,
    width: 300,
  });
}

/**
 * Encrypts a TOTP secret using AES-256-GCM.
 *
 * Stored format:
 * v1:iv:authTag:ciphertext
 */
export function encryptTwoFactorSecret(
  secret: string
): string {
  const key = getEncryptionKey();

  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(
    ENCRYPTION_ALGORITHM,
    key,
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(secret, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    "v1",
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

/**
 * Decrypts a previously encrypted TOTP secret.
 */
export function decryptTwoFactorSecret(
  encryptedSecret: string
): string {
  const parts = encryptedSecret.split(":");

  if (
    parts.length !== 4 ||
    parts[0] !== "v1"
  ) {
    throw new Error("Invalid encrypted two-factor secret format");
  }

  const [, ivHex, authTagHex, encryptedHex] = parts;

  const iv = Buffer.from(ivHex!, "hex");
  const authTag = Buffer.from(authTagHex!, "hex");
  const encrypted = Buffer.from(encryptedHex!, "hex");

  if (
    iv.length !== IV_LENGTH ||
    authTag.length !== AUTH_TAG_LENGTH ||
    encrypted.length === 0 ||
    iv.toString("hex") !== ivHex ||
    authTag.toString("hex") !== authTagHex ||
    encrypted.toString("hex") !== encryptedHex
  ) {
    throw new Error("Invalid encrypted two-factor secret");
  }

  const key = getEncryptionKey();

  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGORITHM,
    key,
    iv
  );

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/**
 * Verifies a six-digit authenticator code.
 *
 * Allows a 30-second clock difference in either direction.
 */
export async function verifyTotpCode(
  secret: string,
  token: string
): Promise<boolean> {
  if (!/^\d{6}$/.test(token)) {
    return false;
  }

  const result = await verify({
    secret,
    token,
    epochTolerance: 30,
  });

  return result.valid;
}