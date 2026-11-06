import { ManagedContentModel, type IManagedContent } from "../../../models/ManagedContent.ts";
import { toListItem } from "../helpers/managedContentHelpers.ts";
import type { ManagedContentListItem } from "../managedContentService.ts";

export async function listPublishedManagedContent(
  section: IManagedContent["section"],
  category?: string
): Promise<ManagedContentListItem[]> {
  const filter: {
    section: IManagedContent["section"];
    status: "published";
    category?: string;
  } = {
    section,
    status: "published",
  };

  if (category) {
    filter.category = category;
  }

  const content = await ManagedContentModel.find(filter)
  .sort({ order: 1, publishedAt: -1 })
  .lean();

  return content.map(toListItem);
}