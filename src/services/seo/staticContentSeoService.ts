import {
  StaticContentSeoModel,
  type IStaticContentSeo,
} from "../../models/seo/StaticContentSeo.ts";

import type {
  SeoSectionKey,
} from "../../models/seo/SeoSettings.ts";

export interface UpsertStaticContentSeoInput {
  section: SeoSectionKey;
  slug: string;
  title?: string | undefined;
  description?: string | undefined;
  image?: string | undefined;
}

/**
 * Retrieve SEO overrides for a static content page.
 */
export async function getStaticContentSeo(
  section: SeoSectionKey,
  slug: string
): Promise<IStaticContentSeo | null> {
  return StaticContentSeoModel.findOne({
    section: section.toLowerCase().trim(),
    slug: slug.toLowerCase().trim(),
  }).lean();
}

/**
 * Create or update SEO overrides for a static content page.
 */
export async function upsertStaticContentSeo(
  input: UpsertStaticContentSeoInput
): Promise<IStaticContentSeo> {
  const { section, slug, ...seo } = input;

  const update: Record<string, string> = {};

  if (seo.title !== undefined) {
    update.title = seo.title.trim();
  }

  if (seo.description !== undefined) {
    update.description = seo.description.trim();
  }

  if (seo.image !== undefined) {
    update.image = seo.image.trim();
  }

  const result =
    await StaticContentSeoModel.findOneAndUpdate(
      {
        section: section.toLowerCase().trim(),
        slug: slug.toLowerCase().trim(),
      },
      {
        $set: update,
        $setOnInsert: {
          section: section.toLowerCase().trim(),
          slug: slug.toLowerCase().trim(),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

  if (!result) {
    throw new Error(
      "Failed to save static content SEO settings."
    );
  }

  return result.toObject();
}

/**
 * Remove SEO overrides for a static content page.
 */
export async function deleteStaticContentSeo(
  section: SeoSectionKey,
  slug: string
): Promise<boolean> {
  const result = await StaticContentSeoModel.deleteOne({
    section: section.toLowerCase().trim(),
    slug: slug.toLowerCase().trim(),
  });

  return result.deletedCount > 0;
}