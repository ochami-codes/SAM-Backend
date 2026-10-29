import { DEFAULT_CONTENT_METADATA } from "../../config/contentMetadata.ts";
import { AppError } from "../../errors/AppError.ts";

import { validateString } from "./string.ts";
import { validateSlug } from "./managedContentValidation.ts";
import { validateManagedContentSection } from "./managedContentValidation.ts";

export interface CreateContentMetadataInput {
  name: string;
  slug: string;
  type: "section" | "category";
  sectionSlug?: string;
  heroImage?: string;
}

export interface UpdateContentMetadataInput {
  name?: string;
  heroImage?: string | null;
}

function slugifyName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export function validateMetadataName(value: unknown): string {
  return validateString(value, "name", {
    required: true,
    minLength: 1,
    maxLength: 50,
  });
}

export function validateMetadataSlug(
  name: string,
  field: "section" | "category"
): string {
  const slug = slugifyName(name);

  if (field === "section") {
    return validateManagedContentSection(slug);
  }

  return validateSlug(slug, "category");
}

export function validateMetadataImage(
  value: unknown,
  allowClear = false
): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null && allowClear) {
    return null;
  }

  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(
      "Invalid metadata image URL",
      400,
      "INVALID_METADATA_IMAGE"
    );
  }

  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    throw new AppError(
      "Invalid metadata image URL",
      400,
      "INVALID_METADATA_IMAGE"
    );
  }

  if (
    url.protocol !== "https:" ||
    url.hostname !== "res.cloudinary.com" ||
    !url.pathname.includes("/image/upload/")
  ) {
    throw new AppError(
      "Image must be a valid Cloudinary image URL",
      400,
      "INVALID_METADATA_IMAGE"
    );
  }

  return url.toString();
}

export function validateMetadataType(
  value: unknown
): "section" | "category" {
  if (value !== "section" && value !== "category") {
    throw new AppError(
      "Metadata type must be section or category",
      400,
      "INVALID_METADATA_TYPE"
    );
  }

  return value;
}

export function validateMetadataSectionSlug(
  value: unknown
): string {
  return validateManagedContentSection(value);
}

export function isDefaultSection(slug: string): boolean {
  return DEFAULT_CONTENT_METADATA.some(
    (section) => section.slug === slug
  );
}

export function isDefaultCategory(
  sectionSlug: string,
  categorySlug: string
): boolean {
  const section = DEFAULT_CONTENT_METADATA.find(
    (item) => item.slug === sectionSlug
  );

  return (
    section?.categories.some(
      (category) =>
        category.slug.toLowerCase() === categorySlug.toLowerCase()
    ) ?? false
  );
}