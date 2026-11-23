import {
  ManagedContentModel,
  type IManagedContent,
  type IContentSeo,
} from "../../models/ManagedContent.ts";

import type {
  SeoSectionKey,
} from "../../models/seo/SeoSettings.ts";

export interface UpdateManagedContentSeoInput {
  section: SeoSectionKey;
  slug: string;
  category?: string;
  seo: IContentSeo;
}

/**
 * Retrieve SEO overrides for managed content.
 */
export async function getManagedContentSeo(
  section: SeoSectionKey,
  slug: string,
  category?: string
): Promise<IContentSeo | null> {
  const content = await ManagedContentModel.findOne({
    section: section.toLowerCase().trim(),
    slug: slug.toLowerCase().trim(),
    category: category
      ? category.toLowerCase().trim()
      : null,
  })
    .select("seo")
    .lean();

  return content?.seo ?? null;
}

/**
 * Update SEO overrides for managed content.
 */
export async function updateManagedContentSeo(
  input: UpdateManagedContentSeoInput
): Promise<IManagedContent> {
  const filter = {
    section: input.section.toLowerCase().trim(),
    slug: input.slug.toLowerCase().trim(),
    category: input.category
      ? input.category.toLowerCase().trim()
      : null,
  };

  const update: Record<string, string> = {};

  if (input.seo.title !== undefined) {
    update["seo.title"] = input.seo.title.trim();
  }

  if (input.seo.description !== undefined) {
    update["seo.description"] =
      input.seo.description.trim();
  }

  if (input.seo.image !== undefined) {
    update["seo.image"] = input.seo.image.trim();
  }

  const content = await ManagedContentModel.findOneAndUpdate(
    filter,
    {
      $set: update,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!content) {
    throw new Error("Managed content not found.");
  }

  return content.toObject();
}

/**
 * Remove all custom SEO overrides from managed content.
 */
export async function deleteManagedContentSeo(
  section: SeoSectionKey,
  slug: string,
  category?: string
): Promise<boolean> {
  const result = await ManagedContentModel.updateOne(
    {
      section: section.toLowerCase().trim(),
      slug: slug.toLowerCase().trim(),
      category: category
        ? category.toLowerCase().trim()
        : null,
    },
    {
      $unset: {
        seo: "",
      },
    }
  );

  return result.modifiedCount > 0;
}