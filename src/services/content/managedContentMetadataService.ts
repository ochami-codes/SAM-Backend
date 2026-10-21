import { ManagedContentModel } from "../../models/ManagedContent.ts";

export interface MetadataItem {
  name: string;
  slug: string;
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

function toMetadataItem(value: string): MetadataItem {
  return {
    name: formatDisplayName(value),
    slug: value,
  };
}

export async function getPublishedContentMetadata(): Promise<ManagedContentMetadata> {
  const [sections, categoryGroups] = await Promise.all([
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
  ]);

  const categoriesBySection = new Map<string, Set<string>>();

  for (const item of categoryGroups) {
    const { section, category } = item._id;

    if (!categoriesBySection.has(section)) {
      categoriesBySection.set(section, new Set());
    }

    categoriesBySection.get(section)!.add(category);
  }

  return {
    sections: sections
      .sort()
      .map(toMetadataItem),

    categories: Array.from(
      categoriesBySection,
      ([section, categories]) => ({
        section,
        categories: Array.from(categories)
          .sort()
          .map(toMetadataItem),
      })
    ),
  };
}