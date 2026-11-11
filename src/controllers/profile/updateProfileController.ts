import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/authenticate.ts";
import { AppError } from "../../errors/AppError.ts";

import { updateProfileSchema } from "../../utils/validation/profile/updateProfileSchema.ts";
import { updateProfile } from "../../services/profile/updateProfileService.ts";

export async function updateProfileController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError(
      "Authentication required",
      401,
      "UNAUTHENTICATED"
    );
  }

  const input = updateProfileSchema.parse(req.body);

  const profile = await updateProfile(userId, input, {
    ipAddress: req.ip,
    userAgent: req.get("user-agent") ?? undefined,
  });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: profile,
  });
}