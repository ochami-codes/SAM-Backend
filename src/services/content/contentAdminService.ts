import {
  deleteGithubContent,
  getGithubContent,
  listGithubContent,
  updateGithubContent,
} from "./githubContentService.ts";

import {
    isContentSection,
  resolveContentPath,
  type ContentIdentifier,
  type ContentSection,
} from "./contentPathResolver.ts";
import { githubConfig } from "../../config/github.ts";

export interface UpdateContentInput {
  content: string;
  sha: string;
  message: string;
}

export interface DeleteContentInput {
  sha: string;
  message: string;
}

export interface ContentListItem {
  section: ContentSection;
  category?: string;
  slug: string;
  path: string;
  sha: string;
}

const contentRoot = "SAM-Frontend/sam-frontend/src/content";

const categorizedSections = [
  "bible-study",
  "family",
  "health",
] as const;

export async function getContent(
  identifier: ContentIdentifier
) {
  const path = resolveContentPath(identifier);

  return getGithubContent(path);
}

export async function updateContent(
  identifier: ContentIdentifier,
  input: UpdateContentInput
) {
  const path = resolveContentPath(identifier);

  return updateGithubContent({
    path,
    content: input.content,
    sha: input.sha,
    message: input.message,
  });
}

export async function deleteContent(
  identifier: ContentIdentifier,
  input: DeleteContentInput
) {
  const path = resolveContentPath(identifier);

  return deleteGithubContent({
    path,
    sha: input.sha,
    message: input.message,
  });
}

export async function listContent(): Promise<ContentListItem[]> {
  const sections = await listGithubContent(
  githubConfig.contentRoot
);

  const content: ContentListItem[] = [];

  for (const section of sections) {
    if (section.type !== "dir") {
      continue;
    }

    if (section.name === "articles") {
      const articles = await listGithubContent(section.path);

      for (const article of articles) {
        if (article.type !== "file" || !article.name.endsWith(".mdx")) {
          continue;
        }

        content.push({
          section: "articles",
          slug: removeMdxExtension(article.name),
          path: article.path,
          sha: article.sha,
        });
      }

      continue;
    }

  if (!isContentSection(section.name)) {
  continue;
}

    const categories = await listGithubContent(section.path);

    for (const category of categories) {
      if (category.type !== "dir") {
        continue;
      }

      const files = await listGithubContent(category.path);

      for (const file of files) {
        if (file.type !== "file" || !file.name.endsWith(".mdx")) {
          continue;
        }

        content.push({
          section: section.name,
          category: category.name,
          slug: removeMdxExtension(file.name),
          path: file.path,
          sha: file.sha,
        });
      }
    }
  }

  return content;
}

function removeMdxExtension(filename: string): string {
  return filename.replace(/\.mdx$/, "");
}
