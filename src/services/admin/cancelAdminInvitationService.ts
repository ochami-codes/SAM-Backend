import { Types } from "mongoose";

import { AdminInvitationModel } from "../../models/AdminInvitation.ts";
import { AppError } from "../../errors/AppError.ts";
import { createAuditLog } from "../../services/audit/auditCreationService.ts";
import { AUDIT_ACTIONS } from "../../constants/auditActions.ts";

interface CancelInvitationInput {
  invitationId: string;
  cancelledBy: string;
}

interface InvitationAuditContext {
  ipAddress?: string;
  userAgent?: string;
}

export async function cancelAdminInvitation(
  {
    invitationId,
    cancelledBy,
  }: CancelInvitationInput,
  auditContext: InvitationAuditContext = {}
): Promise<void> {
  const invitation = await AdminInvitationModel.findByIdAndDelete(
    invitationId
  );

  if (!invitation) {
    throw new AppError(
      "Invitation not found",
      404,
      "INVITATION_NOT_FOUND"
    );
  }

  await createAuditLog({
    actor: {
      userId: new Types.ObjectId(cancelledBy),
    },
    action: AUDIT_ACTIONS.ADMIN_INVITATION_CANCELLED,
    category: "administrators",
    resource: {
      type: "admin_invitation",
      id: invitation._id.toString(),
    },
    description: "Administrator invitation cancelled successfully",
    metadata: {
      invitedFullName: invitation.fullName,
      invitedEmail: invitation.email,
    },
    ...auditContext,
  });
}