import type { Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/authenticate.ts";
import { AppError } from "../../errors/AppError.ts";

import { createProfileUploadSignature } from "../../services/profile/createProfileUploadSignatureService.ts";

export function createProfileUploadSignatureController(
  req: AuthenticatedRequest,
  res: Response
): void {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError(
      "Authentication required",
      401,
      "UNAUTHENTICATED"
    );
  }

  const signature = createProfileUploadSignature(userId);

  res.status(200).json({
    success: true,
    data: signature,
  });
}