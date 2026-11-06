import { Types } from "mongoose";
import { RefreshSessionModel } from "../../models/refreshSession.ts";
import { UserModel } from "../../models/User.ts";
import { AppError } from "../../errors/AppError.ts";
import { createAuditLog } from "../audit/auditCreationService.ts";
import { AUDIT_ACTIONS } from "../../constants/auditActions.ts";

interface UpdateAdministratorStatusInput {
  adminId: string;
  isActive: boolean;
  requestedBy: string;
}

interface AdministratorStatusAuditContext {
  ipAddress?: string;
  userAgent?: string;
}

export async function updateAdministratorStatus(
  {
    adminId,
    isActive,
    requestedBy,
  }: UpdateAdministratorStatusInput,
  auditContext: AdministratorStatusAuditContext = {}
): Promise<void> {
  if (!isActive && adminId === requestedBy) {
    throw new AppError(
      "You cannot suspend your own account",
      403,
      "SELF_SUSPENSION_NOT_ALLOWED"
    );
  }

  const administrator = await UserModel.findOne({
    _id: adminId,
    role: "admin",
  });

  if (!administrator) {
    throw new AppError(
      "Administrator not found",
      404,
      "ADMIN_NOT_FOUND"
    );
  }

  // Avoid recording an event when the status has not changed.
  if (administrator.isActive === isActive) {
    return;
  }

  administrator.isActive = isActive;

await administrator.save();

if (!isActive) {
  await RefreshSessionModel.deleteMany({
    userId: administrator._id,
  });
}

  await createAuditLog({
    actor: {
      userId: new Types.ObjectId(requestedBy)
    },
    action: isActive
      ? AUDIT_ACTIONS.ADMIN_ACTIVATED
      : AUDIT_ACTIONS.ADMIN_SUSPENDED,
    category: "administrators",
    resource: {
      type: "administrator",
      id: administrator._id.toString(),
    },
    description: isActive
      ? "Administrator account activated successfully"
      : "Administrator account suspended successfully",
    metadata: {
      targetFullName: administrator.fullName,
      targetEmail: administrator.email,
      previousStatus: !isActive,
      newStatus: isActive,
    },
    ...auditContext,
  });
}