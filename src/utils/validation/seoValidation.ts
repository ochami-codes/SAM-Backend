import { z } from "zod";

const seoTitleSchema = z
  .string()
  .trim()
  .min(1)
  .max(200);

const seoDescriptionSchema = z
  .string()
  .trim()
  .min(1)
  .max(300);

const seoImageSchema = z
  .string()
  .trim()
  .min(1)
  .max(2048);

const seoSectionConfigSchema = z.object({
  titleTemplate: seoTitleSchema.optional(),
  descriptionTemplate: seoDescriptionSchema.optional(),
  defaultImage: seoImageSchema.optional(),

  categories: z
    .record(
      z.string(),
      z.object({
        titleTemplate: seoTitleSchema.optional(),
        descriptionTemplate: seoDescriptionSchema.optional(),
        defaultImage: seoImageSchema.optional(),
      }).strict()
    )
    .optional(),
}).strict();

export const updateSeoSettingsSchema = z.object({
  siteName: z.string().trim().min(1).max(100).optional(),

  siteUrl: z.string().trim().url().optional(),

  defaultTitle: seoTitleSchema.optional(),

  defaultDescription: seoDescriptionSchema.optional(),

  defaultImage: seoImageSchema.optional(),

  sections: z
    .record(z.string(), seoSectionConfigSchema)
    .optional(),
}).strict();

export const contentSeoSchema = z.object({
  title: seoTitleSchema.optional(),
  description: seoDescriptionSchema.optional(),
  image: seoImageSchema.optional(),
}).strict();

export const staticContentSeoSchema = z.object({
  section: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(200),
  title: seoTitleSchema.optional(),
  description: seoDescriptionSchema.optional(),
  image: seoImageSchema.optional(),
}).strict();

export const managedContentSeoSchema = z.object({
  section: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(100).optional(),
  seo: contentSeoSchema,
}).strict();

export const categorySeoSchema = z.object({
  section: z.string().trim().min(1).max(100),

  category: z.string().trim().min(1).max(100),

  titleTemplate: seoTitleSchema.optional(),

  descriptionTemplate: seoDescriptionSchema.optional(),

  defaultImage: seoImageSchema.optional(),
}).strict();

export type UpdateSeoSettingsData = z.infer<
  typeof updateSeoSettingsSchema
>;

export type ContentSeoData = z.infer<
  typeof contentSeoSchema
>;

export type StaticContentSeoData = z.infer<
  typeof staticContentSeoSchema
>;

export type ManagedContentSeoData = z.infer<
  typeof managedContentSeoSchema
>;

export type CategorySeoData = z.infer<
  typeof categorySeoSchema
>;