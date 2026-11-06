import { ManagedContentModel } from "../../../models/ManagedContent.ts";
import { toListItem } from "../helpers/managedContentHelpers.ts";
import type { ManagedContentListItem } from "../managedContentService.ts";

export async function listManagedContent(): Promise<ManagedContentListItem[]> {
  const content = await ManagedContentModel.find()
    .sort({ updatedAt: -1 })
    .lean();

  return content.map(toListItem);
}