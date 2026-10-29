import type {
  Request,
  Response,
  NextFunction,
} from "express";
import type { AuthenticatedRequest } from "../middleware/authenticate.ts";

import {
  getPublishedContentMetadata,

} from "../services/content/managedContentMetadataService.ts";
import { AppError } from "../errors/AppError.ts";
import { createContentMetadata, getAllContentMetadata, updateContentMetadata } from "../services/content/contentMetadataService.ts";

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
export async function createManagedContentMetadataController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(
        "Authentication required",
        401,
        "UNAUTHORIZED"
      );
    }

    const metadata = await createContentMetadata(
      req.body,
      userId
    );

    res.status(201).json({
      success: true,
      data: metadata,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateManagedContentMetadataController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(
        "Authentication required",
        401,
        "UNAUTHORIZED"
      );
    }

    const { slug, sectionSlug } = req.params;

if (typeof slug !== "string") {
  throw new AppError(
    "Invalid metadata slug",
    400,
    "INVALID_METADATA_PARAMETERS"
  );
}

let type: "section" | "category";

if (sectionSlug !== undefined) {
  if (typeof sectionSlug !== "string") {
    throw new AppError(
      "Invalid section slug",
      400,
      "INVALID_METADATA_PARAMETERS"
    );
  }

  type = "category";
} else {
  type = "section";
}

const metadata = await updateContentMetadata(
  req.body,
  {
    type,
    slug,
    ...(sectionSlug !== undefined ? { sectionSlug } : {}),
  },
  userId
);

    res.status(200).json({
      success: true,
      data: metadata,
    });
  } catch (error) {
    next(error);
  }
}
export async function getAllManagedContentMetadataController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const metadata = await getAllContentMetadata();

    res.status(200).json({
      success: true,
      data: metadata,
    });
  } catch (error) {
    next(error);
  }
}