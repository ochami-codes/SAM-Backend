import mongoose from "mongoose";

import { ContentMetadataModel } from "../../models/ContentMetadata.ts";

import { AppError } from "../../errors/AppError.ts";
import { toObjectId } from "../../utils/validation/ObjectId.ts";

import {
  validateMetadataName,
  validateMetadataSlug,
  validateMetadataImage,
  validateMetadataSectionSlug,
  isDefaultSection,
  isDefaultCategory,
  type CreateContentMetadataInput,
  type UpdateContentMetadataInput,
} from "../../utils/validation/contentMetadataValidation.ts";

import { DEFAULT_CONTENT_METADATA } from "../../config/contentMetadata.ts";

export type MetadataType = "section" | "category";

export interface CreateMetadataOptions {
  name: unknown;
  type: unknown;
  sectionSlug?: unknown;
  heroImage?: unknown;
}

export interface UpdateMetadataOptions {
  name?: unknown;
  heroImage?: unknown;
}
export interface AdminContentMetadataItem {
  name: string;
  slug: string;
  heroImage?: string;
}

export interface AdminContentMetadataSection
  extends AdminContentMetadataItem {
  categories: AdminContentMetadataItem[];
}

export function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

export async function ensureSectionExists(sectionSlug: string): Promise<void> {
  const defaultSection = DEFAULT_CONTENT_METADATA.some(
    (section) => section.slug === sectionSlug
  );

  if (defaultSection) {
    return;
  }

  const customSection = await ContentMetadataModel.exists({
    type: "section",
    slug: sectionSlug,
  });

  if (!customSection) {
    throw new AppError(
      "The specified section does not exist",
      404,
      "CONTENT_SECTION_NOT_FOUND"
    );
  }
}

export async function ensureSectionIsNotArticles(
  sectionSlug: string
): Promise<void> {
  if (sectionSlug === "articles") {
    throw new AppError(
      "Articles cannot have categories",
      400,
      "INVALID_CONTENT_CATEGORY"
    );
  }
}

export function ensureNotDefaultMetadata(
  type: MetadataType,
  slug: string,
  sectionSlug?: string
): void {
  if (
    type === "section" &&
    isDefaultSection(slug)
  ) {
    throw new AppError(
      "Default sections cannot be modified through custom metadata",
      409,
      "DEFAULT_METADATA_PROTECTED"
    );
  }

  if (
    type === "category" &&
    sectionSlug &&
    isDefaultCategory(sectionSlug, slug)
  ) {
    throw new AppError(
      "Default categories cannot be modified through custom metadata",
      409,
      "DEFAULT_METADATA_PROTECTED"
    );
  }
}
export interface MetadataItem {
  name: string;
  slug: string;
  heroImage?: string;
  isDefault?: boolean;
}

export interface ManagedContentMetadata {
  sections: MetadataItem[];
  categories: {
    section: string;
    categories: MetadataItem[];
  }[];
}

export function formatDisplayName(value: string): string {
  return value
    .trim()
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function toMetadataItem(
  value: string,
  metadata?: { name: string; heroImage?: string }
): MetadataItem {
  return {
    name: metadata?.name ?? formatDisplayName(value),
    slug: value,
    ...(metadata?.heroImage
      ? { heroImage: metadata.heroImage }
      : {}),
  };
}

export { createContentMetadata } from "./metadata/createContentMetadata.ts";
export { updateContentMetadata } from "./metadata/updateContentMetadata.ts";
export { getAllContentMetadata } from "./metadata/getAllContentMetadata.ts";
export { getPublishedContentMetadata } from "./metadata/getPublishedContentMetadata.ts";
export { deleteContentMetadata } from "./metadata/deleteContentMetadata.ts";