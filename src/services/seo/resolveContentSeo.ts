import { SeoSettingsModel } from "../../models/seo/SeoSettings.ts";
import { StaticContentSeoModel } from "../../models/seo/StaticContentSeo.ts";
import { applyTemplate, type ResolvedSeo, type SeoContentInput } from "./seoService.ts";

export async function resolveContentSeo(
  content: SeoContentInput
): Promise<ResolvedSeo> {
  const settings = await SeoSettingsModel.findOne({
    key: "global",
  }).lean();

  const sectionSettings =
  settings?.sections instanceof Map
    ? settings.sections.get(content.section)
    : undefined;

  let contentSeo = content.seo;

  if (content.source === "static") {
    const staticSeo =
      await StaticContentSeoModel.findOne({
        section: content.section,
        slug: content.slug,
      }).lean();

    contentSeo = staticSeo
  ? {
      ...(staticSeo.title
        ? { title: staticSeo.title }
        : {}),

      ...(staticSeo.description
        ? { description: staticSeo.description }
        : {}),

      ...(staticSeo.image
        ? { image: staticSeo.image }
        : {}),
    }
  : undefined;
  }

  const siteName =
    settings?.siteName ??
    "Second Advent Ministries";

  const siteUrl =
    settings?.siteUrl ??
    "https://second-advent-ministries.co.ke";

  const templateValues = {
    title: content.title,
    section: content.section,
    siteName,
  };

  const sectionTitle = applyTemplate(
    sectionSettings?.titleTemplate,
    templateValues
  );

  const sectionDescription = applyTemplate(
    sectionSettings?.descriptionTemplate,
    templateValues
  );

  const title =
    contentSeo?.title ||
    sectionTitle ||
    settings?.defaultTitle ||
    content.title;

  const description =
    contentSeo?.description ||
    content.description ||
    sectionDescription ||
    settings?.defaultDescription ||
    "";

  const image =
    contentSeo?.image ||
    content.heroImage ||
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