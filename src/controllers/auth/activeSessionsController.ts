import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/authenticate.ts";

import { AppError } from "../../errors/AppError.ts";

import {
  getActiveSessions,
} from "../../services/auth/activeSessionsService.ts";

export async function getActiveSessionsController(
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

  const sessions = await getActiveSessions(
    authenticatedUser.userId,
    authenticatedUser.sessionId
  );

  res.status(200).json({
    success: true,
    data: {
      sessions,
      total: sessions.length,
    },
  });
}