import mongoose, { Schema, type Model } from "mongoose";

export type SeoSectionKey = string;

export interface ISeoCategoryConfig {
  titleTemplate?: string;
  descriptionTemplate?: string;
  defaultImage?: string;
}

export interface ISeoSectionConfig {
  titleTemplate?: string;
  descriptionTemplate?: string;
  defaultImage?: string;
  categories?: Map<string, ISeoCategoryConfig>;
}

export interface ISeoSettings {
  key: "global";
  siteName?: string;
  siteUrl?: string;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultImage?: string;
  sections: Map<string, ISeoSectionConfig>;
  createdAt: Date;
  updatedAt: Date;
}

const seoCategoryConfigSchema = new Schema<ISeoCategoryConfig>(
  {
    titleTemplate: { type: String, trim: true, maxlength: 200 },
    descriptionTemplate: { type: String, trim: true, maxlength: 300 },
    defaultImage: { type: String, trim: true },
  },
  { _id: false }
);

const seoSectionConfigSchema = new Schema<ISeoSectionConfig>(
  {
    titleTemplate: { type: String, trim: true, maxlength: 200 },
    descriptionTemplate: { type: String, trim: true, maxlength: 300 },
    defaultImage: { type: String, trim: true },
    categories: {
      type: Map,
      of: seoCategoryConfigSchema,
      default: () => new Map(),
    },
  },
  { _id: false }
);

const seoSettingsSchema = new Schema<ISeoSettings>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "global",
      immutable: true,
    },
    siteName: { type: String, trim: true, maxlength: 100 },
    siteUrl: { type: String, trim: true },
    defaultTitle: { type: String, trim: true, maxlength: 200 },
    defaultDescription: { type: String, trim: true, maxlength: 300 },
    defaultImage: { type: String, trim: true },
    sections: {
      type: Map,
      of: seoSectionConfigSchema,
      default: () => new Map(),
    },
  },
  { timestamps: true }
);

export const SeoSettingsModel =
  (mongoose.models.SeoSettings as Model<ISeoSettings> | undefined) ??
  mongoose.model<ISeoSettings>("SeoSettings", seoSettingsSchema);