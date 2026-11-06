import crypto from "node:crypto";

import { AdminInvitationModel } from "../models/AdminInvitation.ts";

import { sendEmail } from "../utils/email/sendEmail.ts";
import { adminInvitationEmail } from "../utils/email/templates/adminInvitationEmail.ts";

import { AppError } from "../errors/AppError.ts";

interface SendAdminInvitationInput {
  fullName: string;
  email: string;
  invitedBy: string;
}

export async function sendAdminInvitation({
  fullName,
  email,
  invitedBy,
}: SendAdminInvitationInput): Promise<void> {
  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    throw new AppError(
      "FRONTEND_URL is not configured",
      500,
      "INTERNAL_SERVER_ERROR"
    );
  }

  const rawToken = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const expiresInHours = 24;

  const expiresAt = new Date(
    Date.now() + expiresInHours * 60 * 60 * 1000
  );

  const invitationUrl =
    `${frontendUrl}/admin/auth/accept-invitation` +
    `?token=${encodeURIComponent(rawToken)}`;

  const emailContent = adminInvitationEmail({
    fullName,
    invitationUrl,
    expiresInHours,
  });

  const invitation = await AdminInvitationModel.create({
    fullName,
    email,
    tokenHash,
    invitedBy,
    expiresAt,
  });

  try {
    await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    // Remove previous invitations only after successful delivery.
    await AdminInvitationModel.deleteMany({
      email,
      _id: { $ne: invitation._id },
    });
  } catch (error) {
    await AdminInvitationModel.deleteOne({
      _id: invitation._id,
    });

    throw error;
  }
}