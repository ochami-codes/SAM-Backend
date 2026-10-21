import type { Request, Response } from "express";

import {
  listPublishedManagedContent,
} from "../services/content/managedContentService.ts";

import {
  managedContentSections,
  type ManagedContentSection,
} from "../types/content/managedContent.ts";

function isManagedContentSection(
  value: unknown
): value is ManagedContentSection {
  return (
    typeof value === "string" &&
    (managedContentSections as readonly string[]).includes(value)
  );
}

export async function listPublishedManagedContentController(
  req: Request,
  res: Response
): Promise<void> {
  const { section, category } = req.params;

  if (!isManagedContentSection(section)) {
    res.status(400).json({
      success: false,
      message: "Invalid content section",
    });

    return;
  }

  const content = await listPublishedManagedContent(
    section,
    typeof category === "string" ? category : undefined
  );

  res.status(200).json({
    success: true,
    data: content,
  });
}