import mongoose, { Schema, type Model } from "mongoose";

export const contentMetadataTypes = [
  "section",
  "category",
] as const;

export type ContentMetadataType =
  (typeof contentMetadataTypes)[number];

export interface IContentMetadata {
  name: string;
  slug: string;
  type: ContentMetadataType;
  sectionSlug?: string;
  heroImage?: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const contentMetadataSchema = new Schema<IContentMetadata>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    type: {
      type: String,
      enum: contentMetadataTypes,
      required: true,
    },

    sectionSlug: {
      type: String,
      trim: true,
      lowercase: true,
      required: function () {
        return this.type === "category";
      },
    },

    heroImage: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

contentMetadataSchema.index(
  { type: 1, slug: 1 },
  {
    unique: true,
    partialFilterExpression: { type: "section" },
  }
);

contentMetadataSchema.index(
  { type: 1, sectionSlug: 1, slug: 1 },
  {
    unique: true,
    partialFilterExpression: { type: "category" },
  }
);

export const ContentMetadataModel: Model<IContentMetadata> =
  (mongoose.models.ContentMetadata as Model<IContentMetadata>) ??
  mongoose.model<IContentMetadata>(
    "ContentMetadata",
    contentMetadataSchema
  );