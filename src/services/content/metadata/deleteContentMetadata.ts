import { AppError } from "../../../errors/AppError.ts";
import { ContentMetadataModel } from "../../../models/ContentMetadata.ts";
import { ManagedContentModel } from "../../../models/ManagedContent.ts";
import { ensureNotDefaultMetadata, type MetadataType } from "../contentMetadataService.ts";

export async function deleteContentMetadata(
  params: {
    type: MetadataType;
    slug: string;
    sectionSlug?: string;
  }
) {
  const { type, slug, sectionSlug } = params;

  // Protect default sections and categories.
  ensureNotDefaultMetadata(type, slug, sectionSlug);

  if (type === "category" && !sectionSlug) {
    throw new AppError(
      "A section slug is required to delete a category",
      400,
      "INVALID_METADATA_PARAMETERS"
    );
  }

  const query = {
    type,
    slug,
    ...(type === "category" && { sectionSlug }),
  };

  const existing = await ContentMetadataModel.findOne(query);

  if (!existing) {
    throw new AppError(
      "Custom metadata not found",
      404,
      "CONTENT_METADATA_NOT_FOUND"
    );
  }

  // Prevent deleting metadata referenced by managed content.
  const contentQuery =
    type === "section"
      ? { section: slug }
      : {
          section: sectionSlug!,
          category: slug,
        };

  const existingContent = await ManagedContentModel.exists(
    contentQuery
  );

  if (existingContent) {
    throw new AppError(
      type === "section"
        ? "This section contains managed content. Delete or move its content before deleting the section."
        : "This category contains managed content. Delete or move its content before deleting the category.",
      409,
      "CONTENT_METADATA_IN_USE"
    );
  }

  if (type === "section") {
    // Remove custom categories belonging to this section.
    await ContentMetadataModel.deleteMany({
      type: "category",
      sectionSlug: slug,
    });
  }

  await existing.deleteOne();

  return {
    type,
    slug,
    ...(sectionSlug ? { sectionSlug } : {}),
  };
}