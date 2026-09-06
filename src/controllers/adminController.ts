import type { Response } from "express";

import type { AuthenticatedRequest } from "../middleware/authenticate.ts";

import { inviteAdmin } from "../services/admin/adminInvitationService.ts";

export async function inviteAdministrator(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { email } = req.body;

  await inviteAdmin({
    email,
    invitedBy: req.user.userId,
  });

  res.status(201).json({
    success: true,
    message:
      "Administrator invitation sent successfully",
  });
}