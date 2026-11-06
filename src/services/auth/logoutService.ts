import crypto from "node:crypto";

import { RefreshSessionModel } from "../../models/refreshSession.ts";
import { UserModel } from "../../models/User.ts";

import { createAuditLog } from "../audit/auditCreationService.ts";
import { AUDIT_ACTIONS } from "../../constants/auditActions.ts";

interface LogoutAuditContext {
  ipAddress?: string;
  userAgent?: string;
}

export async function logoutUser(
  refreshToken: string,
  auditContext: LogoutAuditContext = {}
): Promise<void> {
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await RefreshSessionModel.findOneAndDelete({
    tokenHash,
  });

  // No matching session means there is nothing to revoke.
  if (!session) {
    return;
  }

  const user = await UserModel.findById(session.userId).select(
    "_id fullName email"
  );

  // The session has been revoked even if the user no longer exists.
  if (!user) {
    return;
  }

  await createAuditLog({
    actor: {
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
    },
    action: AUDIT_ACTIONS.LOGOUT,
    category: "authentication",
    resource: {
      type: "refresh_session",
      id: session._id.toString(),
    },
    description: "User logged out successfully",
    metadata: {
      sessionId: session.sessionId,
    },
    ...auditContext,
  });
}