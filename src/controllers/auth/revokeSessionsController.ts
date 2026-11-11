import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/authenticate.ts";

import { AppError } from "../../errors/AppError.ts";

import {
  revokeSession,
  revokeOtherSessions,
} from "../../services/auth/revokeSessionsService.ts";

/**
 * Revoke a specific session belonging to the authenticated administrator.
 */
export async function revokeSessionController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const authenticatedUser = req.user;

  if (!authenticatedUser) {
    throw new AppError(
      "Authentication required.",
      401,
      "AUTHENTICATION_REQUIRED"
    );
  }

  const { sessionId } = req.params;

  if (!sessionId || typeof sessionId !== "string") {
    throw new AppError(
      "A valid session ID is required.",
      400,
      "VALIDATION_ERROR"
    );
  }

  await revokeSession(
    authenticatedUser.userId,
    authenticatedUser.sessionId,
    sessionId
  );

  res.status(200).json({
    success: true,
    message: "Session revoked successfully.",
  });
}

/**
 * Revoke all other sessions while preserving the current session.
 */
export async function revokeOtherSessionsController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const authenticatedUser = req.user;

  if (!authenticatedUser) {
    throw new AppError(
      "Authentication required.",
      401,
      "AUTHENTICATION_REQUIRED"
    );
  }

  const revokedCount = await revokeOtherSessions(
    authenticatedUser.userId,
    authenticatedUser.sessionId
  );

  res.status(200).json({
    success: true,
    message: "Other sessions revoked successfully.",
    data: {
      revokedCount,
    },
  });
}