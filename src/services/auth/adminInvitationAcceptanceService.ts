import crypto from "node:crypto";

import { UserModel } from "../../models/User.ts";
import { AdminInvitationModel } from "../../models/AdminInvitation.ts";
import { withTransaction } from "../../utils/database/transaction.ts";
import { hashPassword } from "../../utils/password.ts";
import { AppError } from "../../errors/AppError.ts";

interface AcceptInvitationInput {
  password: string;
  token: string;
}

export async function acceptAdminInvitation({
  password,
  token
}: AcceptInvitationInput): Promise<void> {
  if (!token || !password) {
    throw new AppError(
      "Invitation token and password are required",
      400,
      "VALIDATION_ERROR"
    );
  }

  /*
   * Hash the raw token received from the browser.
   *
   * MongoDB stores only this hash, never the raw token.
   */
  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  /*
   * Find the invitation.
   */
  const invitation = await AdminInvitationModel.findOne({
    tokenHash,
  });

  if (!invitation) {
    throw new AppError(
      "Invalid or expired invitation",
      400,
      "INVALID_INVITATION"
    );
  }

  /*
   * Explicit expiration check.
   *
   * The MongoDB TTL index is only for cleanup and should
   * not be relied upon for authorization.
   */
  if (invitation.expiresAt <= new Date()) {
    await AdminInvitationModel.deleteOne({
      _id: invitation._id,
    });

    throw new AppError(
      "Invalid or expired invitation",
      400,
      "INVALID_INVITATION"
    );
  }

  /*
   * Make sure an account has not already been created
   * for this email.
   */
  const existingUser = await UserModel.findOne({
    email: invitation.email,
  });

  if (existingUser) {
    await AdminInvitationModel.deleteOne({
      _id: invitation._id,
    });

    throw new AppError(
      "An account with this email already exists",
      409,
      "ACCOUNT_ALREADY_EXISTS"
    );
  }

  /*
   * Hash the administrator's new password.
   */
  const passwordHash = await hashPassword(password);

/*
 * Create the administrator account and consume
 * the invitation atomically.
 */
await withTransaction(async (session) => {
  await UserModel.create(
    [
      {
        email: invitation.email,
        passwordHash,
        role: "admin",
        isActive: true,
        mustChangePassword: false,
      },
    ],
    { session }
  );

  /*
   * Invitations are single-use.
   */
  await AdminInvitationModel.deleteOne(
    {
      _id: invitation._id,
    },
    { session }
  );
});
}