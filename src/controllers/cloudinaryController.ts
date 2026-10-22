import type { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler.ts"; // adjust path if needed
import {
  listCloudinaryMedia,
  createCloudinaryUploadSignature,
} from "../services/media/cloudinaryService.ts";

export const getCloudinaryMedia = asyncHandler(async (req, res) => {
  const rawLimit = req.query.limit;
  const rawCursor = req.query.nextCursor;

  const limit = rawLimit === undefined ? 24 : Number(rawLimit);

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    res.status(400).json({
      success: false,
      message: "Limit must be an integer between 1 and 100.",
    });
    return;
  }

  if (
    rawCursor !== undefined &&
    (typeof rawCursor !== "string" || rawCursor.length > 2048)
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid pagination cursor.",
    });
    return;
  }

  const media = await listCloudinaryMedia(
    limit,
    typeof rawCursor === "string" ? rawCursor : undefined
  );

  res.status(200).json({
    success: true,
    data: media,
  });
});

export function createCloudinaryUploadSignatureController(
  _req: Request,
  res: Response
): void {
  const signature = createCloudinaryUploadSignature();

  res.status(200).json({
    success: true,
    data: signature,
  });
}