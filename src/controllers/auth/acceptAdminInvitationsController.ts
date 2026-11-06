import { acceptAdminInvitation } from "../../services/auth/adminInvitationAcceptanceService.ts";
import type { Request, Response } from "express";

export async function acceptAdminInvitations(
  req: Request,
  res: Response
): Promise<void> {
  const { password, token } = req.body;

  const ipAddress = req.ip;
  const userAgent = req.get("user-agent");

  await acceptAdminInvitation(
    { password, token },
    {
      ...(ipAddress !== undefined && { ipAddress }),
      ...(userAgent !== undefined && { userAgent }),
    }
  );

  res.status(200).json({
    success: true,
    message: "Admin invitation accepted successfully",
  });
}