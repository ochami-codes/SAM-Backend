import { AppError } from "../../../errors/AppError.ts";
import { ContentMetadataModel } from "../../../models/ContentMetadata.ts";
import { validateMetadataImage, validateMetadataName, validateMetadataSectionSlug, validateMetadataSlug, type CreateContentMetadataInput } from "../../../utils/validation/contentMetadataValidation.ts";
import { toObjectId } from "../../../utils/validation/ObjectId.ts";
import { ensureNotDefaultMetadata, ensureSectionExists, ensureSectionIsNotArticles, isDuplicateKeyError, type CreateMetadataOptions, type MetadataType } from "../contentMetadataService.ts";

export async function createContentMetadata(
  input: CreateMetadataOptions,
  userId: string
) {
  const name = validateMetadataName(input.name);

  if (input.type !== "section" && input.type !== "category") {
    throw new AppError(
      "Invalid metadata type",
      400,
      "INVALID_METADATA_TYPE"
    );
  }

  const type: MetadataType = input.type;

  const slug = validateMetadataSlug(
    name,
    type === "section" ? "section" : "category"
  );

  let sectionSlug: string | undefined;

  if (type === "category") {
    sectionSlug = validateMetadataSectionSlug(input.sectionSlug);

    await ensureSectionExists(sectionSlug);
    await ensureSectionIsNotArticles(sectionSlug);
  }

  ensureNotDefaultMetadata(type, slug, sectionSlug);

  const heroImage = validateMetadataImage(input.heroImage);

  const userObjectId = toObjectId(userId, "userId");

  const metadataInput: CreateContentMetadataInput = {
    name,
    slug,
    type,
    ...(sectionSlug && { sectionSlug }),
    ...(heroImage && { heroImage }),
  };

  try {
    return await ContentMetadataModel.create({
      ...metadataInput,
      createdBy: userObjectId,
      updatedBy: userObjectId,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AppError(
        "This section or category already exists",
        409,
        "CONTENT_METADATA_ALREADY_EXISTS"
      );
    }

    throw error;
  }
}
