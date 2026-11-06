import { Types } from "mongoose";

import { AdminInvitationModel } from "../../models/AdminInvitation.ts";
import { sendAdminInvitation } from "../../utils/sendAdminInvitation.ts";
import { AppError } from "../../errors/AppError.ts";
import { createAuditLog } from "../../services/audit/auditCreationService.ts";
import { AUDIT_ACTIONS } from "../../constants/auditActions.ts";

interface ResendInvitationInput {
  invitationId: string;
  invitedBy: string;
}

interface InvitationAuditContext {
  ipAddress?: string;
  userAgent?: string;
}

export async function resendAdminInvitation(
  {
    invitationId,
    invitedBy,
  }: ResendInvitationInput,
  auditContext: InvitationAuditContext = {}
): Promise<void> {
  const invitation = await AdminInvitationModel.findOne({
    _id: invitationId,
    expiresAt: { $gt: new Date() },
  });

  if (!invitation) {
    throw new AppError(
      "Invitation not found or expired",
      404,
      "INVITATION_NOT_FOUND"
    );
  }

  await sendAdminInvitation({
    fullName: invitation.fullName,
    email: invitation.email,
    invitedBy,
  });

  await createAuditLog({
    actor: {
      userId: new Types.ObjectId(invitedBy),
    },
    action: AUDIT_ACTIONS.ADMIN_INVITATION_RESENT,
    category: "administrators",
    resource: {
      type: "admin_invitation",
      id: invitation._id.toString(),
    },
    description: "Administrator invitation resent successfully",
    metadata: {
      invitedFullName: invitation.fullName,
      invitedEmail: invitation.email,
    },
    ...auditContext,
  });
}