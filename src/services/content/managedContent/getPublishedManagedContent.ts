import { AppError } from "../../../errors/AppError.ts";
import { ManagedContentModel } from "../../../models/ManagedContent.ts";
import type { ManagedContentIdentifier } from "../../../utils/validation/managedContentValidation.ts";
import { toContentData } from "../helpers/managedContentHelpers.ts";
import type { ManagedContentData } from "../managedContentService.ts";

export async function getPublishedManagedContent(
  identifier: ManagedContentIdentifier
): Promise<ManagedContentData> {

const matchingDocuments = await ManagedContentModel.find({
  section: identifier.section,
  slug: identifier.slug,
  status: "published",
}).lean();

  const content = await ManagedContentModel.findOne({
    section: identifier.section,
    ...(identifier.category && {
      category: identifier.category,
    }),
    slug: identifier.slug,
    status: "published",
  });

  if (!content) {
    throw new AppError(
      "Managed content not found",
      404,
      "CONTENT_NOT_FOUND"
    );
  }

  return toContentData(content);
}
