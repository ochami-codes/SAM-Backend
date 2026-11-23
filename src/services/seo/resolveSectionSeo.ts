import { SeoSettingsModel } from "../../models/seo/SeoSettings.ts";
import { applyTemplate, type ResolvedSeo, type SeoSectionPageInput } from "./seoService.ts";

export async function resolveSectionSeo(
  input: SeoSectionPageInput
): Promise<ResolvedSeo> {
  const settings = await SeoSettingsModel.findOne({
    key: "global",
  }).lean();

  const sectionSettings =
    settings?.sections instanceof Map
      ? settings.sections.get(input.section)
      : undefined;

  const siteName =
    settings?.siteName ??
    "Second Advent Ministries";

  const siteUrl =
    settings?.siteUrl ??
    "https://second-advent-ministries.co.ke";

  const templateValues = {
    title: input.title,
    section: input.section,
    siteName,
  };

  const title =
    applyTemplate(
      sectionSettings?.titleTemplate,
      templateValues
    ) ||
    input.title ||
    settings?.defaultTitle ||
    siteName;

  const description =
    applyTemplate(
      sectionSettings?.descriptionTemplate,
      templateValues
    ) ||
    input.description ||
    settings?.defaultDescription ||
    "";

  const image =
    input.heroImage ||
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