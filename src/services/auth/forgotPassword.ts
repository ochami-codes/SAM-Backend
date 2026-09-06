import crypto from "node:crypto";

import { UserModel } from "../../models/User.ts";
import { PasswordResetTokenModel } from "../../models/PasswordResetToken.ts";

import { sendEmail } from "../../utils/email/sendEmail.ts";
import { passwordResetEmail } from "../../utils/email/templates/passwordResetEmail.ts";

export async function requestPasswordReset(
  email: string
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await UserModel.findOne({
    email: normalizedEmail,
  });

  // Do not reveal whether the account exists.
  if (!user) {
    return;
  }

  // Remove any existing reset tokens for this user.
  await PasswordResetTokenModel.deleteMany({
    userId: user._id,
  });

  // Generate a cryptographically secure reset token.
  const rawToken = crypto.randomBytes(32).toString("hex");

  // Store only the hash in MongoDB.
  const tokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const expiresInMinutes = 15;

  const expiresAt = new Date(
    Date.now() + expiresInMinutes * 60 * 1000
  );

  await PasswordResetTokenModel.create({
    userId: user._id,
    tokenHash,
    expiresAt,
  });

  // Build the URL the user will open from the email.
  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    throw new Error("FRONTEND_URL is not defined");
  }

  const resetUrl =
    `${frontendUrl}/admin/auth/reset-password` +
    `?token=${encodeURIComponent(rawToken)}`;

  // Generate the email.
  const emailContent = passwordResetEmail({
    resetUrl,
    expiresInMinutes,
  });

  // Send the email.
  await sendEmail({
    to: user.email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });
}