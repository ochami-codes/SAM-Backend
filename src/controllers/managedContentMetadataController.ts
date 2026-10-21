import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  getPublishedContentMetadata,
} from "../services/content/managedContentMetadataService.ts";

export async function getManagedContentMetadataController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const metadata = await getPublishedContentMetadata();

    res.status(200).json({
      success: true,
      data: metadata,
    });
  } catch (error) {
    next(error);
  }
}