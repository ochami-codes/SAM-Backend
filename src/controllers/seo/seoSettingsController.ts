import type { Request, Response } from "express";
import { updateSeoSettingsSchema } from "../../utils/validation/seoValidation.ts";
import {
  getSeoSettings,
  updateSeoSettings,
} from "../../services/seo/seoSettingsService.ts";
import { AppError } from "../../errors/AppError.ts";
import type {
  ISeoCategoryConfig,
  ISeoSectionConfig,
} from "../../models/seo/SeoSettings.ts";

type CategoryInput = NonNullable<
  NonNullable<
    NonNullable<
      ReturnType<typeof updateSeoSettingsSchema.parse>
    >["sections"]
  >[string]["categories"]
>[string];

type SectionInput = NonNullable<
  ReturnType<typeof updateSeoSettingsSchema.parse>["sections"]
>[string];

function toCategoryConfig(input: CategoryInput): ISeoCategoryConfig {
  return {
    ...(input.titleTemplate !== undefined && {
      titleTemplate: input.titleTemplate,
    }),
    ...(input.descriptionTemplate !== undefined && {
      descriptionTemplate: input.descriptionTemplate,
    }),
    ...(input.defaultImage !== undefined && {
      defaultImage: input.defaultImage,
    }),
  };
}

function toSectionConfig(input: SectionInput): ISeoSectionConfig {
  return {
    ...(input.titleTemplate !== undefined && {
      titleTemplate: input.titleTemplate,
    }),
    ...(input.descriptionTemplate !== undefined && {
      descriptionTemplate: input.descriptionTemplate,
    }),
    ...(input.defaultImage !== undefined && {
      defaultImage: input.defaultImage,
    }),
    ...(input.categories !== undefined && {
      categories: new Map(
        Object.entries(input.categories).map(([name, config]) => [
          name,
          toCategoryConfig(config),
        ])
      ),
    }),
  };
}

/**
 * Retrieve global SEO settings.
 */
export async function getSeoSettingsController(
  _req: Request,
  res: Response
): Promise<void> {
  const settings = await getSeoSettings();
  res.status(200).json({ success: true, data: settings });
}

/**
 * Update global SEO settings.
 */
export async function updateSeoSettingsController(
  req: Request,
  res: Response
): Promise<void> {
  const validation = updateSeoSettingsSchema.safeParse(req.body);

  if (!validation.success) {
    throw new AppError("Invalid SEO settings.", 400, "VALIDATION_ERROR");
  }

  const input = validation.data;

  const settings = await updateSeoSettings({
    ...(input.siteName !== undefined && { siteName: input.siteName }),
    ...(input.siteUrl !== undefined && { siteUrl: input.siteUrl }),
    ...(input.defaultTitle !== undefined && {
      defaultTitle: input.defaultTitle,
    }),
    ...(input.defaultDescription !== undefined && {
      defaultDescription: input.defaultDescription,
    }),
    ...(input.defaultImage !== undefined && {
      defaultImage: input.defaultImage,
    }),
    ...(input.sections !== undefined && {
      sections: new Map(
        Object.entries(input.sections).map(([name, config]) => [
          name,
          toSectionConfig(config),
        ])
      ),
    }),
  });

  res.status(200).json({
    success: true,
    message: "SEO settings updated successfully.",
    data: settings,
  });
}