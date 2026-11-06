import { UserModel } from "../../models/User.ts";
import { sendAdminInvitation } from "../../utils/sendAdminInvitation.ts";
import { AppError } from "../../errors/AppError.ts";
import { Types } from "mongoose";
import {
  validateEmail,
  validateString,
} from "../../utils/validation/index.ts";
import { createAuditLog } from "../../services/audit/auditCreationService.ts";
import { AUDIT_ACTIONS } from "../../constants/auditActions.ts";

interface InviteAdminInput {
  fullName: string;
  email: string;
  invitedBy: string;
}

interface InvitationAuditContext {
  ipAddress?: string;
  userAgent?: string;
}

export async function inviteAdmin(
  {
    fullName,
    email,
    invitedBy,
  }: InviteAdminInput,
  auditContext: InvitationAuditContext = {}
): Promise<void> {
  const validatedName = validateString(
    fullName,
    "Full name",
    {
      minLength: 2,
      maxLength: 100,
    }
  );

  const normalizedEmail = validateEmail(email);

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

  await sendAdminInvitation({
    fullName: validatedName,
    email: normalizedEmail,
    invitedBy,
  });

  await createAuditLog({
    actor: {
      userId: new Types.ObjectId(invitedBy),
    },
    action: AUDIT_ACTIONS.ADMIN_INVITED,
    category: "administrators",
    resource: {
      type: "admin_invitation",
    },
    description: "Administrator invitation sent successfully",
    metadata: {
      invitedFullName: validatedName,
      invitedEmail: normalizedEmail,
    },
    ...auditContext,
  });
}