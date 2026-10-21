import type { Request, Response } from "express";

import {
  validateManagedContentIdentifier,
} from "../utils/validation/managedContentValidation.ts";

import {
  getPublishedManagedContent,
} from "../services/content/managedContentService.ts";

export async function getPublishedManagedContentController(
  req: Request,
  res: Response
): Promise<void> {
  const identifier = validateManagedContentIdentifier(
    req.params.section,
    req.params.category,
    req.params.slug
  );

  const content = await getPublishedManagedContent(
    identifier
  );

  res.status(200).json({
    success: true,
    data: content,
  });
}