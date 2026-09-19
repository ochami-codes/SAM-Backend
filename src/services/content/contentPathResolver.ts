import { AppError } from "../../errors/AppError.ts";

export const contentSections = [
  "articles",
  "bible-study",
  "family",
  "health",
] as const;

export type ContentSection = (typeof contentSections)[number];
const contentSectionSet = new Set<string>(
  contentSections
);

export function isContentSection(
  value: string
): value is ContentSection {
  return contentSectionSet.has(value);
}

export interface ArticleIdentifier {
  section: "articles";
  slug: string;
}

export interface StudyIdentifier {
  section: "bible-study" | "family" | "health";
  category: string;
  slug: string;
}

export type ContentIdentifier =
  | ArticleIdentifier
  | StudyIdentifier;

const contentRoot =
  process.env.GITHUB_CONTENT_ROOT ?? "src/content";

export function resolveContentPath(
  input: ContentIdentifier
): string {
  const slug = validateSlug(input.slug);

  if (input.section === "articles") {
    return `${contentRoot}/articles/${slug}.mdx`;
  }

  const category = validateSlug(input.category);

  return `${contentRoot}/${input.section}/${category}/${slug}.mdx`;
}

function validateSlug(value: string): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    throw new AppError(
      "Invalid content identifier",
      400,
      "INVALID_CONTENT_IDENTIFIER"
    );
  }

  return value;
}