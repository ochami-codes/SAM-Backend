import { AppError } from "../../../errors/AppError.ts";
import type { ManagedContentIdentifier } from "../../../utils/validation/managedContentValidation.ts";
import { findByIdentifier, toContentData } from "../helpers/managedContentHelpers.ts";
import type { ManagedContentData } from "../managedContentService.ts";

export async function getManagedContent(
  identifier: ManagedContentIdentifier
): Promise<ManagedContentData> {
  const content = await findByIdentifier(identifier);
  if (!content) {
    throw new AppError("Managed content not found", 404, "CONTENT_NOT_FOUND");
  }
  return toContentData(content);
}
