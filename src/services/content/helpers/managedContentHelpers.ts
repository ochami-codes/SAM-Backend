/* -------------------- Helpers -------------------- */

import { ManagedContentModel } from "../../../models/ManagedContent.ts";
import type { ManagedContentIdentifier } from "../../../utils/validation/managedContentValidation.ts";
import type { ManagedContent, ManagedContentData, ManagedContentDocument, ManagedContentLeanDocument, ManagedContentListItem } from "../managedContentService.ts";

export async function findByIdentifier(
  identifier: ManagedContentIdentifier
): Promise<ManagedContentDocument | null> {
  return ManagedContentModel.findOne({
    section: identifier.section,
    ...(identifier.category && { category: identifier.category }),
    slug: identifier.slug,
  });
}

export function toListItem(
  content: ManagedContentLeanDocument
): ManagedContentListItem {
  return {
    id: content._id.toString(),
    title: content.title,
    slug: content.slug,
    section: content.section,
    ...(content.category && { category: content.category }),
    ...(content.description && {
      description: content.description,
    }),
    ...(content.heroImage && {
      heroImage: content.heroImage,
    }),
    ...(content.order !== undefined && {
      order: content.order,
    }),
    status: content.status,
    ...(content.publishedAt && {
      publishedAt: content.publishedAt,
    }),
    createdAt: content.createdAt,
    updatedAt: content.updatedAt,
  };
}

export function toContentData(
  content: ManagedContent
): ManagedContentData {
  return {
    id: content._id.toString(),
    title: content.title,
    slug: content.slug,
    section: content.section,
    ...(content.category && { category: content.category }),
    content: content.content,
    ...(content.description && {
      description: content.description,
    }),
    ...(content.heroImage && {
      heroImage: content.heroImage,
    }),
    ...(content.order !== undefined && {
      order: content.order,
    }),
    status: content.status,
    createdBy: content.createdBy.toString(),
    updatedBy: content.updatedBy.toString(),
    ...(content.publishedAt && {
      publishedAt: content.publishedAt,
    }),
    createdAt: content.createdAt,
    updatedAt: content.updatedAt,
  };
}