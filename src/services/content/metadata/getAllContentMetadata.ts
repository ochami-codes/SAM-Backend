import { ContentMetadataModel } from "../../../models/ContentMetadata.ts";
import type { AdminContentMetadataSection } from "../contentMetadataService.ts";

export async function getAllContentMetadata(): Promise<
  AdminContentMetadataSection[]
> {
  const metadata = await ContentMetadataModel.find({})
    .sort({ type: 1, name: 1 })
    .lean();

  const sections = new Map<string, AdminContentMetadataSection>();

  // Collect custom sections.
  for (const item of metadata) {
    if (item.type !== "section") {
      continue;
    }

    sections.set(item.slug, {
      name: item.name,
      slug: item.slug,
      ...(item.heroImage ? { heroImage: item.heroImage } : {}),
      categories: [],
    });
  }

  // Attach custom categories to their parent sections.
  for (const item of metadata) {
    if (item.type !== "category" || !item.sectionSlug) {
      continue;
    }

    let section = sections.get(item.sectionSlug);

    // A category may belong to a default section that isn't stored
    // as a custom section in ContentMetadataModel.
    if (!section) {
      section = {
        name: item.sectionSlug,
        slug: item.sectionSlug,
        categories: [],
      };

      sections.set(item.sectionSlug, section);
    }

    section.categories.push({
      name: item.name,
      slug: item.slug,
      ...(item.heroImage ? { heroImage: item.heroImage } : {}),
    });
  }

  return Array.from(sections.values());
}