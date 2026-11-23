import { SeoSettingsModel, type ISeoCategoryConfig, type ISeoSectionConfig } from "../../models/seo/SeoSettings.ts";

import {
  applyTemplate,
  getMapValue,
  type ResolvedSeo,
  type SeoCategoryPageInput,
} from "./seoService.ts";

export async function resolveCategorySeo(
  input: SeoCategoryPageInput
): Promise<ResolvedSeo> {
  const settings = await SeoSettingsModel.findOne({
    key: "global",
  }).lean();

  const sectionSettings = getMapValue<ISeoSectionConfig>(
  settings?.sections,
  input.section
);

const categorySettings = getMapValue<ISeoCategoryConfig>(
  sectionSettings?.categories,
  input.category
);

  const siteName =
    settings?.siteName ?? "Second Advent Ministries";

  const siteUrl =
    settings?.siteUrl ??
    "https://second-advent-ministries.co.ke";

  const templateValues = {
    title: input.title,
    category: input.title,
    section: input.section,
    siteName,
  };

  const title =
    applyTemplate(
      categorySettings?.titleTemplate,
      templateValues
    ) || `${input.title} | ${siteName}`;

  const description =
    applyTemplate(
      categorySettings?.descriptionTemplate,
      templateValues
    ) ||
    input.description ||
    settings?.defaultDescription ||
    "";

  const image =
    categorySettings?.defaultImage ||
    sectionSettings?.defaultImage ||
    settings?.defaultImage ||
    "";

  return {
    title,
    description,
    image,
    siteName,
    siteUrl,
  };
}