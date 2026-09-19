import { AppError } from "../../errors/AppError.ts";
import { validateString } from "../../utils/validation/string.ts";
import type { ContentIdentifier } from "../../services/content/contentPathResolver.ts";
import { validateObject} from "../validation/object.ts"

export interface UpdateContentBody {
  content: string;
  sha: string;
  message: string;
}

export interface DeleteContentBody {
  sha: string;
  message: string;
}

export function validateContentIdentifier(
  section: unknown,
  category: unknown,
  slug: unknown
): ContentIdentifier {
  const validatedSection = validateString(section, "section", {
    required: true,
    minLength: 1,
    maxLength: 50,
  });

  const validatedSlug = validateString(slug, "slug", {
    required: true,
    minLength: 1,
    maxLength: 200,
  });

  if (validatedSection === "articles") {
    return { section: "articles", slug: validatedSlug };
  }

  if (
    validatedSection !== "bible-study" &&
    validatedSection !== "family" &&
    validatedSection !== "health"
  ) {
    throw new AppError(
      "Invalid content section",
      400,
      "INVALID_CONTENT_SECTION"
    );
  }

  const validatedCategory = validateString(category, "category", {
    required: true,
    minLength: 1,
    maxLength: 100,
  });

  return {
    section: validatedSection,
    category: validatedCategory,
    slug: validatedSlug,
  };
}

export function validateUpdateContentBody(
  body: unknown
): UpdateContentBody {
  const data = validateObject(body);

  return {
    content: validateString(data.content, "content", {
      required: true,
      minLength: 1,
      maxLength: 1_000_000,
      trim: false,
    }),
    sha: validateString(data.sha, "sha", {
      required: true,
      minLength: 1,
      maxLength: 100,
    }),
    message: validateString(data.message, "message", {
      required: true,
      minLength: 1,
      maxLength: 200,
    }),
  };
}

export function validateDeleteContentBody(
  body: unknown
): DeleteContentBody {
  const data = validateObject(body);

  return {
    sha: validateString(data.sha, "sha", {
      required: true,
      minLength: 1,
      maxLength: 100,
    }),
    message: validateString(data.message, "message", {
      required: true,
      minLength: 1,
      maxLength: 200,
    }),
  };
}
