import mongoose, { Schema, type Model } from "mongoose";

export const managedContentSections = [
  "articles",
  "bible-study",
  "family",
  "health",
] as const;

export type ManagedContentSection =
  (typeof managedContentSections)[number];

export const managedContentStatuses = [
  "draft",
  "published",
] as const;

export type ManagedContentStatus =
  (typeof managedContentStatuses)[number];

export interface IManagedContent {
  title: string;
  slug: string;
  section: ManagedContentSection;
  category?: string;
  content: string;
  heroImage?: string;
  status: ManagedContentStatus;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const managedContentSchema =
  new Schema<IManagedContent>(
    {
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
      },

      slug: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxlength: 200,
      },

      section: {
        type: String,
        required: true,
        enum: managedContentSections,
      },

      category: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 100,
      },

      content: {
        type: String,
        required: true,
      },

      heroImage: {
        type: String,
        trim: true,
      },

      status: {
        type: String,
        required: true,
        enum: managedContentStatuses,
        default: "draft",
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

      publishedAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
    }
  );

managedContentSchema.index(
  { section: 1, category: 1, slug: 1 },
  { unique: true }
);

managedContentSchema.index({
  status: 1,
  section: 1,
  category: 1,
});

const existingManagedContentModel =
  mongoose.models.ManagedContent as
    | Model<IManagedContent>
    | undefined;

export const ManagedContentModel =
  existingManagedContentModel ??
  mongoose.model<IManagedContent>(
    "ManagedContent",
    managedContentSchema
  );