import type { Request, Response } from "express";

import {
  listPublishedManagedContent,
} from "../services/content/managedContentService.ts";

import {
  ContentMetadataModel,
} from "../models/ContentMetadata.ts";

export async function listPublishedManagedContentController(
  req: Request,
  res: Response
): Promise<void> {
  const { section, category } = req.params;

  if (typeof section !== "string" || !section.trim()) {
    res.status(400).json({
      success: false,
      message: "A valid content section is required",
    });
    return;
  }

  const normalizedSection = section.trim().toLowerCase();
  const normalizedCategory =
    typeof category === "string"
      ? category.trim().toLowerCase()
      : undefined;

  // Allow built-in sections and sections registered in metadata.
  const isCustomSection = await ContentMetadataModel.exists({
    type: "section",
    slug: normalizedSection,
  });

  const isBuiltInSection = [
    "articles",
    "bible-study",
    "family",
    "health",
  ].includes(normalizedSection);

  if (!isBuiltInSection && !isCustomSection) {
    res.status(404).json({
      success: false,
      message: "Content section not found",
    });
    return;
  }

  const content = await listPublishedManagedContent(
    normalizedSection,
    normalizedCategory
  );

  res.status(200).json({
    success: true,
    data: content,
  });
}