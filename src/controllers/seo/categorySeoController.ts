import type { Request, Response } from "express";

import {
  categorySeoSchema,
} from "../../utils/validation/seoValidation.ts";

import {
  getCategorySeoSettings,
  upsertCategorySeoSettings,
  deleteCategorySeoSettings,
} from "../../services/seo/categorySeoSettingsService.ts";

import { AppError } from "../../errors/AppError.ts";

export async function getCategorySeoController(
  req: Request,
  res: Response
): Promise<void> {
  const validation = categorySeoSchema
    .pick({
      section: true,
      category: true,
    })
    .safeParse(req.params);

  if (!validation.success) {
    throw new AppError(
      "Invalid section or category.",
      400,
      "VALIDATION_ERROR"
    );
  }

  const { section, category } = validation.data;

  const settings = await getCategorySeoSettings(
    section,
    category
  );

  res.status(200).json({
    success: true,
    data: settings,
  });
}

export async function updateCategorySeoController(
  req: Request,
  res: Response
): Promise<void> {
  const validation = categorySeoSchema.safeParse(req.body);

  if (!validation.success) {
    throw new AppError(
      "Invalid category SEO settings.",
      400,
      "VALIDATION_ERROR"
    );
  }

  const settings = await upsertCategorySeoSettings(
    validation.data
  );

  res.status(200).json({
    success: true,
    message: "Category SEO settings updated successfully.",
    data: settings,
  });
}

export async function deleteCategorySeoController(
  req: Request,
  res: Response
): Promise<void> {
  const validation = categorySeoSchema
    .pick({
      section: true,
      category: true,
    })
    .safeParse(req.params);

  if (!validation.success) {
    throw new AppError(
      "Invalid section or category.",
      400,
      "VALIDATION_ERROR"
    );
  }

  const { section, category } = validation.data;

  await deleteCategorySeoSettings(section, category);

  res.status(200).json({
    success: true,
    message: "Category SEO settings deleted successfully.",
  });
}