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

type MetadataType = "section" | "category";

interface CreateMetadataOptions {
  name: unknown;
  type: unknown;
  sectionSlug?: unknown;
  heroImage?: unknown;
}

interface UpdateMetadataOptions {
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

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

async function ensureSectionExists(sectionSlug: string): Promise<void> {
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

async function ensureSectionIsNotArticles(
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

function ensureNotDefaultMetadata(
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

export async function createContentMetadata(
  input: CreateMetadataOptions,
  userId: string
) {
  const name = validateMetadataName(input.name);

  if (input.type !== "section" && input.type !== "category") {
    throw new AppError(
      "Invalid metadata type",
      400,
      "INVALID_METADATA_TYPE"
    );
  }

  const type: MetadataType = input.type;

  const slug = validateMetadataSlug(
    name,
    type === "section" ? "section" : "category"
  );

  let sectionSlug: string | undefined;

  if (type === "category") {
    sectionSlug = validateMetadataSectionSlug(input.sectionSlug);

    await ensureSectionExists(sectionSlug);
    await ensureSectionIsNotArticles(sectionSlug);
  }

  ensureNotDefaultMetadata(type, slug, sectionSlug);

  const heroImage = validateMetadataImage(input.heroImage);

  const userObjectId = toObjectId(userId, "userId");

  const metadataInput: CreateContentMetadataInput = {
    name,
    slug,
    type,
    ...(sectionSlug && { sectionSlug }),
    ...(heroImage && { heroImage }),
  };

  try {
    return await ContentMetadataModel.create({
      ...metadataInput,
      createdBy: userObjectId,
      updatedBy: userObjectId,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AppError(
        "This section or category already exists",
        409,
        "CONTENT_METADATA_ALREADY_EXISTS"
      );
    }

    throw error;
  }
}

export async function updateContentMetadata(
  input: UpdateMetadataOptions,
  params: {
    type: MetadataType;
    slug: string;
    sectionSlug?: string;
  },
  userId: string
) {
  const { type, slug, sectionSlug } = params;

  ensureNotDefaultMetadata(type, slug, sectionSlug);

  const query = {
    type,
    slug,
    ...(type === "category" && { sectionSlug }),
  };

  const existing = await ContentMetadataModel.findOne(query);

  if (!existing) {
    throw new AppError(
      "Custom metadata not found",
      404,
      "CONTENT_METADATA_NOT_FOUND"
    );
  }

  const updates: {
    name?: string;
    heroImage?: string;
    updatedBy: mongoose.Types.ObjectId;
  } = {
    updatedBy: toObjectId(userId, "userId"),
  };

  if (input.name !== undefined) {
    updates.name = validateMetadataName(input.name);
  }

  if (input.heroImage !== undefined) {
    const heroImage = validateMetadataImage(
      input.heroImage,
      true
    );

    if (heroImage === null) {
  existing.set("heroImage", undefined);
} else if (heroImage !== undefined) {
  updates.heroImage = heroImage;
}                        
  }

  if (updates.name !== undefined) {
    existing.name = updates.name;
  }

  if (updates.heroImage !== undefined) {
    existing.heroImage = updates.heroImage;
  }

  existing.updatedBy = updates.updatedBy;

  await existing.save();

  return existing;
}

export async function getAllContentMetadata(): Promise<
  AdminContentMetadataSection[]
> {
  const metadata = await ContentMetadataModel.find({})
    .sort({ type: 1, name: 1 })
    .lean();

  const sections = new Map<string, AdminContentMetadataSection>();

  // Collect custom sections.
  for (const item of metadata) {
    if (item.type !== "section") {
      continue;
    }

    sections.set(item.slug, {
      name: item.name,
      slug: item.slug,
      ...(item.heroImage ? { heroImage: item.heroImage } : {}),
      categories: [],
    });
  }

  // Attach custom categories to their parent sections.
  for (const item of metadata) {
    if (item.type !== "category" || !item.sectionSlug) {
      continue;
    }

    let section = sections.get(item.sectionSlug);

    // A category may belong to a default section that isn't stored
    // as a custom section in ContentMetadataModel.
    if (!section) {
      section = {
        name: item.sectionSlug,
        slug: item.sectionSlug,
        categories: [],
      };

      sections.set(item.sectionSlug, section);
    }

    section.categories.push({
      name: item.name,
      slug: item.slug,
      ...(item.heroImage ? { heroImage: item.heroImage } : {}),
    });
  }

  return Array.from(sections.values());
}