import type { Response } from "express";

import type { AuthenticatedRequest } from "../middleware/authenticate.ts";

import { inviteAdmin } from "../services/admin/adminInvitationService.ts";

export async function inviteAdministrator(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { fullName, email } = req.body;

  await inviteAdmin({
    fullName,
    email,
    invitedBy: req.user!.userId,
  });

  res.status(201).json({
    success: true,
    message:
      "Administrator invitation sent successfully",
  });
}