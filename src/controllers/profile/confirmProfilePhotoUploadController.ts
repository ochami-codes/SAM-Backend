import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/authenticate.ts";
import { AppError } from "../../errors/AppError.ts";

import { confirmProfilePhotoUpload } from "../../services/profile/confirmProfilePhotoUploadService.ts";

export async function confirmProfilePhotoUploadController(
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

  const { assetId } = req.body ?? {};

  if (
    typeof assetId !== "string" ||
    assetId.trim().length === 0 ||
    assetId.length > 255
  ) {
    throw new AppError(
      "A valid Cloudinary asset ID is required.",
      400,
      "INVALID_ASSET_ID"
    );
  }

  await confirmProfilePhotoUpload(
    assetId.trim(),
    userId,
    {
      ipAddress: req.ip,
      userAgent: req.get("user-agent") ?? undefined,
    }
  );

  res.status(200).json({
    success: true,
    message: "Profile photo updated successfully.",
  });
}