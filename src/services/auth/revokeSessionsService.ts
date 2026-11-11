import { RefreshSessionModel } from "../../models/refreshSession.ts";
import { AppError } from "../../errors/AppError.ts";

/**
 * Revoke one session belonging to the authenticated administrator.
 * The current session cannot be revoked through this operation.
 */
export async function revokeSession(
  userId: string,
  currentSessionId: string,
  targetSessionId: string
): Promise<void> {
  if (targetSessionId === currentSessionId) {
    throw new AppError(
      "You cannot revoke your current session here. Use logout instead.",
      400,
      "CANNOT_REVOKE_CURRENT_SESSION"
    );
  }

  const result = await RefreshSessionModel.deleteOne({
    userId,
    sessionId: targetSessionId,
  });

  if (result.deletedCount === 0) {
    throw new AppError(
      "Session not found or already revoked.",
      404,
      "SESSION_NOT_FOUND"
    );
  }
}

/**
 * Revoke every other session belonging to the authenticated administrator.
 * The current session remains active.
 */
export async function revokeOtherSessions(
  userId: string,
  currentSessionId: string
): Promise<number> {
  const result = await RefreshSessionModel.deleteMany({
    userId,
    sessionId: { $ne: currentSessionId },
  });

  return result.deletedCount;
}