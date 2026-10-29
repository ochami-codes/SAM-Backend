import { ManagedContentModel } from "../../models/ManagedContent.ts";
import { ContentMetadataModel } from "../../models/ContentMetadata.ts";

export interface MetadataItem {
  name: string;
  slug: string;
  heroImage?: string;
  isDefault?: boolean;
}

export interface ManagedContentMetadata {
  sections: MetadataItem[];
  categories: {
    section: string;
    categories: MetadataItem[];
  }[];
}

function formatDisplayName(value: string): string {
  return value
    .trim()
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function toMetadataItem(
  value: string,
  metadata?: { name: string; heroImage?: string }
): MetadataItem {
  return {
    name: metadata?.name ?? formatDisplayName(value),
    slug: value,
    ...(metadata?.heroImage
      ? { heroImage: metadata.heroImage }
      : {}),
  };
}

export async function getPublishedContentMetadata(): Promise<ManagedContentMetadata> {
  const [publishedSections, categoryGroups, metadataRecords] =
    await Promise.all([
      ManagedContentModel.distinct("section", {
        status: "published",
      }),

      ManagedContentModel.aggregate<{
        _id: {
          section: string;
          category: string;
        };
      }>([
        {
          $match: {
            status: "published",
            category: {
              $exists: true,
              $nin: ["", null],
            },
          },
        },
        {
          $group: {
            _id: {
              section: "$section",
              category: "$category",
            },
          },
        },
        {
          $sort: {
            "_id.section": 1,
            "_id.category": 1,
          },
        },
      ]),

      ContentMetadataModel.find({
        $or: [{ type: "section" }, { type: "category" }],
      })
        .select("name slug type sectionSlug heroImage")
        .lean(),
    ]);

  const sectionMetadata = new Map(
    metadataRecords
      .filter((item) => item.type === "section")
      .map((item) => [
        item.slug,
        {
          name: item.name,
          ...(item.heroImage ? { heroImage: item.heroImage } : {}),
        },
      ]),
  );

  const categoryMetadata = new Map(
    metadataRecords
      .filter((item) => item.type === "category")
      .map((item) => [
        `${item.sectionSlug}:${item.slug}`,
        {
          name: item.name,
          ...(item.heroImage ? { heroImage: item.heroImage } : {}),
        },
      ]),
  );

  const categoriesBySection = new Map<string, Set<string>>();

  for (const { _id: { section, category } } of categoryGroups) {
    if (!categoriesBySection.has(section)) {
      categoriesBySection.set(section, new Set());
    }

    categoriesBySection.get(section)!.add(category);
  }

  return {
    sections: publishedSections
      .sort()
      .map((slug) =>
        toMetadataItem(slug, sectionMetadata.get(slug)),
      ),

    categories: Array.from(categoriesBySection, ([section, categories]) => ({
      section,
      categories: Array.from(categories)
        .sort()
        .map((slug) =>
          toMetadataItem(
            slug,
            categoryMetadata.get(`${section}:${slug}`),
          ),
        ),
    })),
  };
}