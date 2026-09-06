import crypto from "node:crypto";

import { UserModel } from "../../models/User.ts";
import { AdminInvitationModel } from "../../models/AdminInvitation.ts";

import { sendEmail } from "../../utils/email/sendEmail.ts";
import { adminInvitationEmail } from "../../utils/email/templates/adminInvitationEmail.ts";
import { AppError } from "../../errors/AppError.ts";

interface InviteAdminInput {
  email: string;
  invitedBy: string;
}

export async function inviteAdmin({
  email,
  invitedBy,
}: InviteAdminInput): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new AppError(
      "Email address is required",
      400,
      "VALIDATION_ERROR"
    );
  }

  /*
   * Check whether an account already exists.
   */
  const existingUser = await UserModel.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new AppError(
      "An account with this email already exists",
      409,
      "ACCOUNT_ALREADY_EXISTS"
    );
  }

  /*
   * Remove any previous invitation for this email.
   */
  await AdminInvitationModel.deleteMany({
    email: normalizedEmail,
  });

  /*
   * Generate a cryptographically secure invitation token.
   */
  const rawToken = crypto.randomBytes(32).toString("hex");

  /*
   * Store only the hash in MongoDB.
   */
  const tokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  /*
   * Invitations are valid for 24 hours.
   */
  const expiresInHours = 24;

  const expiresAt = new Date(
    Date.now() +
      expiresInHours * 60 * 60 * 1000
  );

  await AdminInvitationModel.create({
    email: normalizedEmail,
    tokenHash,
    invitedBy,
    expiresAt,
  });

  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    throw new Error(
      "FRONTEND_URL is not defined"
    );
  }

  /*
   * The raw token is only placed in the email link.
   * It is never stored in MongoDB.
   */
  const invitationUrl =
    `${frontendUrl}/admin/auth/accept-invitation` +
    `?token=${encodeURIComponent(rawToken)}`;

  const emailContent = adminInvitationEmail({
    invitationUrl,
    expiresInHours,
  });

  await sendEmail({
    to: normalizedEmail,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });
}