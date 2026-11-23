import type { Request, Response } from "express";

import {
  managedContentSeoSchema,
} from "../../utils/validation/seoValidation.ts";

import {
  getManagedContentSeo,
  updateManagedContentSeo,
  deleteManagedContentSeo,
} from "../../services/seo/managedContentSeoService.ts";

import { AppError } from "../../errors/AppError.ts";

const managedContentParamsSchema =
  managedContentSeoSchema.pick({
    section: true,
    slug: true,
    category: true,
  });

/**
 * Retrieve SEO overrides for managed content.
 */
export async function getManagedContentSeoController(
  req: Request,
  res: Response
): Promise<void> {
  const validation = managedContentParamsSchema.safeParse(
    req.params
  );

  if (!validation.success) {
    throw new AppError(
      "Invalid content section, slug or category.",
      400,
      "VALIDATION_ERROR"
    );
  }

  const { section, slug, category } = validation.data;

  const seo = await getManagedContentSeo(
    section,
    slug,
    category
  );

  res.status(200).json({
    success: true,
    data: seo,
  });
}

/**
 * Update SEO overrides for managed content.
 */
export async function updateManagedContentSeoController(
  req: Request,
  res: Response
): Promise<void> {
  const validation = managedContentSeoSchema.safeParse(
    req.body
  );

  if (!validation.success) {
    throw new AppError(
      "Invalid managed content SEO data.",
      400,
      "VALIDATION_ERROR"
    );
  }

  const input = validation.data;

  const seo = {
    ...(input.seo.title !== undefined
      ? { title: input.seo.title }
      : {}),

    ...(input.seo.description !== undefined
      ? { description: input.seo.description }
      : {}),

    ...(input.seo.image !== undefined
      ? { image: input.seo.image }
      : {}),
  };

  const result = await updateManagedContentSeo({
    section: input.section,
    slug: input.slug,
    ...(input.category !== undefined
      ? { category: input.category }
      : {}),
    seo,
  });

  res.status(200).json({
    success: true,
    message: "Managed content SEO updated successfully.",
    data: result,
  });
}

/**
 * Remove SEO overrides from managed content.
 */
export async function deleteManagedContentSeoController(
  req: Request,
  res: Response
): Promise<void> {
  const validation = managedContentParamsSchema.safeParse(
    req.params
  );

  if (!validation.success) {
    throw new AppError(
      "Invalid content section, slug or category.",
      400,
      "VALIDATION_ERROR"
    );
  }

  const { section, slug, category } = validation.data;

  const deleted = await deleteManagedContentSeo(
    section,
    slug,
    category
  );

  if (!deleted) {
    throw new AppError(
      "Managed content SEO settings not found.",
      404,
      "NOT_FOUND"
    );
  }

  res.status(200).json({
    success: true,
    message: "Managed content SEO overrides deleted successfully.",
  });
}