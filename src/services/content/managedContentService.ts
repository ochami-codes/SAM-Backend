import mongoose, { type HydratedDocument } from "mongoose";

import { ManagedContentModel, type IManagedContent } from "../../models/ManagedContent.ts";
import { AppError } from "../../errors/AppError.ts";

import type {
  CreateManagedContentBody,
  ManagedContentIdentifier,
  UpdateManagedContentBody,
} from "../../utils/validation/managedContentValidation.ts";

import { toObjectId } from "../../utils/validation/ObjectId.ts";

/* -------------------- Types -------------------- */
type ManagedContent =
  mongoose.HydratedDocument<IManagedContent>;
  type ManagedContentLeanDocument =
  IManagedContent & {
    _id: mongoose.Types.ObjectId;
  };

export interface ManagedContentListItem {
  id: string;
  title: string;
  slug: string;
  section: IManagedContent["section"];
  category?: string;
  description?: string;
  heroImage?: string;
  order?: number;
  status: IManagedContent["status"];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ManagedContentData {
  id: string;
  title: string;
  slug: string;
  section: IManagedContent["section"];
  category?: string;
  content: string;
  description?: string;
  heroImage?: string;
  order?: number;
  status: IManagedContent["status"];
  createdBy: string;
  updatedBy: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

type ManagedContentDocument = HydratedDocument<IManagedContent>;

/* -------------------- CRUD -------------------- */
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

export async function listManagedContent(): Promise<ManagedContentListItem[]> {
  const content = await ManagedContentModel.find()
    .sort({ updatedAt: -1 })
    .lean();

  return content.map(toListItem);
}

export async function getManagedContent(
  identifier: ManagedContentIdentifier
): Promise<ManagedContentData> {
  const content = await findByIdentifier(identifier);
  if (!content) {
    throw new AppError("Managed content not found", 404, "CONTENT_NOT_FOUND");
  }
  return toContentData(content);
}

export async function createManagedContent(
  input: CreateManagedContentBody,
  userId: string
): Promise<ManagedContentData> {
  const existing = await findByIdentifier({
    section: input.section,
    ...(input.category && { category: input.category }),
    slug: input.slug,
  });

  if (existing) {
    throw new AppError(
      "Managed content with this identifier already exists",
      409,
      "CONTENT_ALREADY_EXISTS"
    );
  }

  const userObjectId = toObjectId(userId, "userId");

  const content = await ManagedContentModel.create({
    title: input.title,
    slug: input.slug,
    section: input.section,
    ...(input.category && { category: input.category }),
    content: input.content,
    ...(input.description && { description: input.description }),
    ...(input.heroImage && { heroImage: input.heroImage }),
    ...(input.order !== undefined && { order: input.order }),
    status: input.status,
    createdBy: userObjectId,
    updatedBy: userObjectId,
    ...(input.status === "published" && { publishedAt: new Date() }),
  });

  if (!content) {
    throw new AppError("Managed content not found", 404, "CONTENT_NOT_FOUND");
  }

  return toContentData(content);
}

export async function updateManagedContent(
  identifier: ManagedContentIdentifier,
  input: UpdateManagedContentBody,
  userId: string
): Promise<ManagedContentData> {
  const content = await findByIdentifier(identifier);
  if (!content) {
    throw new AppError("Managed content not found", 404, "CONTENT_NOT_FOUND");
  }

  const identifierChanged =
    content.section !== input.section ||
    content.slug !== input.slug ||
    content.category !== input.category;

  if (identifierChanged) {
    const duplicate = await findByIdentifier({
      section: input.section,
      ...(input.category && { category: input.category }),
      slug: input.slug,
    });

    if (duplicate && duplicate._id.toString() !== content._id.toString()) {
      throw new AppError(
        "Managed content with this identifier already exists",
        409,
        "CONTENT_ALREADY_EXISTS"
      );
    }
  }

  Object.assign(content, {
    ...(input.title && { title: input.title }),
    ...(input.slug && { slug: input.slug }),
    ...(input.section && { section: input.section }),
    ...(input.category && { category: input.category }),
    ...(input.content && { content: input.content }),
    ...(input.description && { description: input.description }),
    ...(input.heroImage && { heroImage: input.heroImage }),
    ...(input.order !== undefined && { order: input.order }),
    updatedBy: toObjectId(userId, "userId"),
  });

  await content.save();
  return toContentData(content);
}

export async function deleteManagedContent(
  identifier: ManagedContentIdentifier
): Promise<void> {
  const content = await findByIdentifier(identifier);
  if (!content) {
    throw new AppError("Managed content not found", 404, "CONTENT_NOT_FOUND");
  }
  await ManagedContentModel.deleteOne({ _id: content._id });
}

export async function publishManagedContent(
  identifier: ManagedContentIdentifier,
  userId: string
): Promise<ManagedContentData> {
  const content = await findByIdentifier(identifier);
  if (!content) {
    throw new AppError("Managed content not found", 404, "CONTENT_NOT_FOUND");
  }

  Object.assign(content, {
    status: "published",
    publishedAt: new Date(),
    updatedBy: toObjectId(userId, "userId"),
  });

  await content.save();
  return toContentData(content);
}

export async function unpublishManagedContent(
  identifier: ManagedContentIdentifier,
  userId: string
): Promise<ManagedContentData> {
  const content = await findByIdentifier(identifier);
  if (!content) {
    throw new AppError("Managed content not found", 404, "CONTENT_NOT_FOUND");
  }

  Object.assign(content, {
    status: "draft",
    publishedAt: undefined,
    updatedBy: toObjectId(userId, "userId"),
  });

  await content.save();
  return toContentData(content);
}

/* -------------------- Helpers -------------------- */

async function findByIdentifier(
  identifier: ManagedContentIdentifier
): Promise<ManagedContentDocument | null> {
  return ManagedContentModel.findOne({
    section: identifier.section,
    ...(identifier.category && { category: identifier.category }),
    slug: identifier.slug,
  });
}

function toListItem(
  content: ManagedContentLeanDocument
): ManagedContentListItem {
  return {
    id: content._id.toString(),
    title: content.title,
    slug: content.slug,
    section: content.section,
    ...(content.category && { category: content.category }),
    ...(content.description && {
      description: content.description,
    }),
    ...(content.heroImage && {
      heroImage: content.heroImage,
    }),
    ...(content.order !== undefined && {
      order: content.order,
    }),
    status: content.status,
    ...(content.publishedAt && {
      publishedAt: content.publishedAt,
    }),
    createdAt: content.createdAt,
    updatedAt: content.updatedAt,
  };
}

function toContentData(
  content: ManagedContent
): ManagedContentData {
  return {
    id: content._id.toString(),
    title: content.title,
    slug: content.slug,
    section: content.section,
    ...(content.category && { category: content.category }),
    content: content.content,
    ...(content.description && {
      description: content.description,
    }),
    ...(content.heroImage && {
      heroImage: content.heroImage,
    }),
    ...(content.order !== undefined && {
      order: content.order,
    }),
    status: content.status,
    createdBy: content.createdBy.toString(),
    updatedBy: content.updatedBy.toString(),
    ...(content.publishedAt && {
      publishedAt: content.publishedAt,
    }),
    createdAt: content.createdAt,
    updatedAt: content.updatedAt,
  };
}