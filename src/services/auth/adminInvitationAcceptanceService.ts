import crypto from "node:crypto";
import { Types } from "mongoose";
import { UserModel } from "../../models/User.ts";
import { AdminInvitationModel } from "../../models/AdminInvitation.ts";
import { withTransaction } from "../../utils/database/transaction.ts";
import { hashPassword } from "../../utils/password.ts";
import { AppError } from "../../errors/AppError.ts";
import { createAuditLog } from "../../services/audit/auditCreationService.ts";
import { AUDIT_ACTIONS } from "../../constants/auditActions.ts";

interface AcceptInvitationInput {
  password: string;
  token: string;
}

interface InvitationAuditContext {
  ipAddress?: string;
  userAgent?: string;
}

export async function acceptAdminInvitation(
  {
    password,
    token,
  }: AcceptInvitationInput,
  auditContext: InvitationAuditContext = {}
): Promise<void> {
  if (!token || !password) {
    throw new AppError(
      "Invitation token and password are required",
      400,
      "VALIDATION_ERROR"
    );
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

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

  const passwordHash = await hashPassword(password);

  let createdUserId: Types.ObjectId | undefined;

  await withTransaction(async (session) => {
    const [createdUser] = await UserModel.create(
      [
        {
          fullName: invitation.fullName,
          email: invitation.email,
          passwordHash,
          role: "admin",
          isActive: true,
          mustChangePassword: false,
        },
      ],
      { session }
    );
if (!createdUser) {
  throw new AppError(
    "Administrator account creation failed",
    500,
    "ACCOUNT_CREATION_FAILED"
  );
}
    createdUserId = createdUser._id;

    const consumedInvitation = await AdminInvitationModel.deleteOne(
      {
        _id: invitation._id,
      },
      { session }
    );

    if (consumedInvitation.deletedCount !== 1) {
      throw new AppError(
        "Invitation could not be consumed",
        409,
        "INVITATION_ALREADY_USED"
      );
    }
  });

  if (!createdUserId) {
    throw new AppError(
      "Administrator account creation failed",
      500,
      "ACCOUNT_CREATION_FAILED"
    );
  }

  await createAuditLog({
    actor: {
      userId: createdUserId,
      fullName: invitation.fullName,
      email: invitation.email,
    },
    action: AUDIT_ACTIONS.ADMIN_INVITATION_ACCEPTED,
    category: "authentication",
    resource: {
      type: "admin_invitation",
      id: invitation._id.toString(),
    },
    description: "Administrator successfully accepted an invitation",
    metadata: {
      role: "admin",
      invitationId: invitation._id.toString(),
      invitedBy: invitation.invitedBy.toString(),
    },
    ...auditContext,
  });
}