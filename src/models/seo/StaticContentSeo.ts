import mongoose, { Schema, type Model } from "mongoose";

import type { SeoSectionKey } from "./SeoSettings.ts";

export interface IStaticContentSeo {
  section: SeoSectionKey;
  slug: string;

  title?: string;
  description?: string;
  image?: string;

  createdAt: Date;
  updatedAt: Date;
}

const staticContentSeoSchema =
  new Schema<IStaticContentSeo>(
    {
      section: {
       type: String,
required: true,
lowercase: true,
trim: true,
maxlength: 100,
      },

      slug: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        maxlength: 200,
      },

      title: {
        type: String,
        trim: true,
        maxlength: 200,
      },

      description: {
        type: String,
        trim: true,
        maxlength: 300,
      },

      image: {
        type: String,
        trim: true,
      },
    },
    { timestamps: true }
  );

staticContentSeoSchema.index(
  { section: 1, slug: 1 },
  { unique: true }
);

const existingStaticContentSeoModel =
  mongoose.models.StaticContentSeo as
    | Model<IStaticContentSeo>
    | undefined;

export const StaticContentSeoModel =
  existingStaticContentSeoModel ??
  mongoose.model<IStaticContentSeo>(
    "StaticContentSeo",
    staticContentSeoSchema
  );