import type mongoose from "mongoose";
import { AppError } from "../../../errors/AppError.ts";
import { ContentMetadataModel } from "../../../models/ContentMetadata.ts";
import { ensureNotDefaultMetadata, type MetadataType, type UpdateMetadataOptions } from "../contentMetadataService.ts";
import { toObjectId } from "../../../utils/validation/ObjectId.ts";
import { validateMetadataImage, validateMetadataName } from "../../../utils/validation/contentMetadataValidation.ts";

export async function updateContentMetadata(
  input: UpdateMetadataOptions,
  params: {
    type: MetadataType;
    slug: string;
    sectionSlug?: string;
  },
  userId: string
) {
  const { type, slug, sectionSlug } = params;

  ensureNotDefaultMetadata(type, slug, sectionSlug);

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

  const updates: {
    name?: string;
    heroImage?: string;
    updatedBy: mongoose.Types.ObjectId;
  } = {
    updatedBy: toObjectId(userId, "userId"),
  };

  if (input.name !== undefined) {
    updates.name = validateMetadataName(input.name);
  }

  if (input.heroImage !== undefined) {
    const heroImage = validateMetadataImage(
      input.heroImage,
      true
    );

    if (heroImage === null) {
  existing.set("heroImage", undefined);
} else if (heroImage !== undefined) {
  updates.heroImage = heroImage;
}                        
  }

  if (updates.name !== undefined) {
    existing.name = updates.name;
  }

  if (updates.heroImage !== undefined) {
    existing.heroImage = updates.heroImage;
  }

  existing.updatedBy = updates.updatedBy;

  await existing.save();

  return existing;
}
