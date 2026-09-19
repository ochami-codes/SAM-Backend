import { AppError } from "../../errors/AppError.ts";
import {
  managedContentSections,
  managedContentStatuses,
  type ManagedContentSection,
  type ManagedContentStatus,
} from "../../models/ManagedContent.ts";
import { validateObject } from "./object.ts";
import { validateString } from "./string.ts";

export interface ManagedContentIdentifier {
  section: ManagedContentSection;
  category?: string;
  slug: string;
}

export interface CreateManagedContentBody {
  title: string;
  slug: string;
  section: ManagedContentSection;
  category?: string;
  content: string;
  heroImage?: string;
  status: ManagedContentStatus;
}

export interface UpdateManagedContentBody {
  title: string;
  slug: string;
  section: ManagedContentSection;
  category?: string;
  content: string;
  heroImage?: string;
}

export function validateManagedContentIdentifier(
  section: unknown,
  category: unknown,
  slug: unknown
): ManagedContentIdentifier {
  const validatedSection =
    validateManagedContentSection(section);

  const validatedSlug = validateSlug(slug);

  if (validatedSection === "articles") {
    if (category !== undefined) {
      throw new AppError(
        "Articles cannot have a category",
        400,
        "INVALID_CONTENT_CATEGORY"
      );
    }

    return {
      section: validatedSection,
      slug: validatedSlug,
    };
  }

  const validatedCategory = validateSlug(
    category,
    "category"
  );

  return {
    section: validatedSection,
    category: validatedCategory,
    slug: validatedSlug,
  };
}

export function validateCreateManagedContentBody(
  body: unknown
): CreateManagedContentBody {
  const data = validateObject(body);

  const section =
    validateManagedContentSection(data.section);

  const title = validateString(data.title, "title", {
    required: true,
    minLength: 1,
    maxLength: 200,
  });

  const slug = validateSlug(data.slug);

  const category = validateManagedContentCategory(
    section,
    data.category
  );

  const content = validateString(data.content, "content", {
    required: true,
    minLength: 1,
    maxLength: 1_000_000,
    trim: false,
  });

  const heroImage = validateOptionalString(
    data.heroImage,
    "heroImage",
    500
  );

  const status = validateManagedContentStatus(
    data.status ?? "draft"
  );

  return {
    title,
    slug,
    section,
    ...(category && { category }),
    content,
    ...(heroImage && { heroImage }),
    status,
  };
}

export function validateUpdateManagedContentBody(
  body: unknown
): UpdateManagedContentBody {
  const data = validateObject(body);

  const section =
    validateManagedContentSection(data.section);

  const title = validateString(data.title, "title", {
    required: true,
    minLength: 1,
    maxLength: 200,
  });

  const slug = validateSlug(data.slug);

  const category = validateManagedContentCategory(
    section,
    data.category
  );

  const content = validateString(data.content, "content", {
    required: true,
    minLength: 1,
    maxLength: 1_000_000,
    trim: false,
  });

  const heroImage = validateOptionalString(
    data.heroImage,
    "heroImage",
    500
  );

  return {
    title,
    slug,
    section,
    ...(category && { category }),
    content,
    ...(heroImage && { heroImage }),
  };
}

export function validateManagedContentSection(
  value: unknown
): ManagedContentSection {
  const section = validateString(value, "section", {
    required: true,
    minLength: 1,
    maxLength: 50,
  });

  if (
    !managedContentSections.includes(
      section as ManagedContentSection
    )
  ) {
    throw new AppError(
      "Invalid content section",
      400,
      "INVALID_CONTENT_SECTION"
    );
  }

  return section as ManagedContentSection;
}

export function validateManagedContentStatus(
  value: unknown
): ManagedContentStatus {
  const status = validateString(value, "status", {
    required: true,
    minLength: 1,
    maxLength: 20,
  });

  if (
    !managedContentStatuses.includes(
      status as ManagedContentStatus
    )
  ) {
    throw new AppError(
      "Invalid content status",
      400,
      "INVALID_CONTENT_STATUS"
    );
  }

  return status as ManagedContentStatus;
}

function validateManagedContentCategory(
  section: ManagedContentSection,
  value: unknown
): string | undefined {
  if (section === "articles") {
    if (value !== undefined) {
      throw new AppError(
        "Articles cannot have a category",
        400,
        "INVALID_CONTENT_CATEGORY"
      );
    }

    return undefined;
  }

  return validateSlug(value, "category");
}

function validateSlug(
  value: unknown,
  fieldName = "slug"
): string {
  const slug = validateString(value, fieldName, {
    required: true,
    minLength: 1,
    maxLength: 200,
  });

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new AppError(
      `${fieldName} must contain only lowercase letters, numbers, and hyphens`,
      400,
      "INVALID_SLUG"
    );
  }

  return slug;
}

function validateOptionalString(
  value: unknown,
  fieldName: string,
  maxLength: number
): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  return validateString(value, fieldName, {
    required: false,
    maxLength,
  });
}