import {
  type SeoSectionKey,
} from "../../models/seo/SeoSettings.ts";

import type {
  IContentSeo,
} from "../../models/ManagedContent.ts";

type ContentSource = "managed" | "static";

export interface SeoContentInput {
  section: SeoSectionKey;
  slug: string;
  title: string;
  description?: string;
  heroImage?: string;
  seo?: IContentSeo;
  source: ContentSource;
}

export interface ResolvedSeo {
  title: string;
  description: string;
  image: string;
  siteName: string;
  siteUrl: string;
}
export interface SeoSectionPageInput {
  section: SeoSectionKey;
  title: string;
  description?: string;
  heroImage?: string;
}
export interface SeoCategoryPageInput {
  section: SeoSectionKey;
  category: string;
  title: string;
  description?: string;
}

export function applyTemplate(
  template: string | undefined,
  values: Record<string, string>
): string | undefined {
  if (!template) return undefined;

  return template.replace(
    /\{(\w+)\}/g,
    (_, key: string) => values[key] ?? ""
  );
}
export function getMapValue<T = unknown>(
  value: unknown,
  key: string
): T | undefined {
  if (value instanceof Map) {
    return value.get(key) as T | undefined;
  }

  if (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return (value as Record<string, T>)[key];
  }

  return undefined;
}
export { resolveCategorySeo } from "./resolveCategorySeo.ts";
export { resolveContentSeo } from "./resolveContentSeo.ts";
export { resolveSectionSeo } from "./resolveSectionSeo.ts";