import type { Request, Response } from "express";

import {
  staticContentSeoSchema,
} from "../../utils/validation/seoValidation.ts";

import {
  getStaticContentSeo,
  upsertStaticContentSeo,
  deleteStaticContentSeo,
} from "../../services/seo/staticContentSeoService.ts";

import { AppError } from "../../errors/AppError.ts";

const staticContentParamsSchema =
  staticContentSeoSchema.pick({
    section: true,
    slug: true,
  });

/**
 * Retrieve SEO overrides for static content.
 */
export async function getStaticContentSeoController(
  req: Request,
  res: Response
): Promise<void> {
  const validation = staticContentParamsSchema.safeParse(
    req.params
  );

  if (!validation.success) {
    throw new AppError(
      "Invalid content section or slug.",
      400,
      "VALIDATION_ERROR"
    );
  }

  const { section, slug } = validation.data;

  const seo = await getStaticContentSeo(
    section,
    slug
  );

  res.status(200).json({
    success: true,
    data: seo,
  });
}

/**
 * Create or update SEO overrides for static content.
 */
export async function upsertStaticContentSeoController(
  req: Request,
  res: Response
): Promise<void> {
  const validation = staticContentSeoSchema.safeParse(
    req.body
  );

  if (!validation.success) {
    throw new AppError(
      "Invalid static content SEO data.",
      400,
      "VALIDATION_ERROR"
    );
  }

  const seo = await upsertStaticContentSeo(
    validation.data
  );

  res.status(200).json({
    success: true,
    message: "Static content SEO saved successfully.",
    data: seo,
  });
}

/**
 * Delete SEO overrides for static content.
 */
export async function deleteStaticContentSeoController(
  req: Request,
  res: Response
): Promise<void> {
  const validation = staticContentParamsSchema.safeParse(
    req.params
  );

  if (!validation.success) {
    throw new AppError(
      "Invalid content section or slug.",
      400,
      "VALIDATION_ERROR"
    );
  }

  const { section, slug } = validation.data;

  const deleted = await deleteStaticContentSeo(
    section,
    slug
  );

  if (!deleted) {
    throw new AppError(
      "Static content SEO settings not found.",
      404,
      "NOT_FOUND"
    );
  }

  res.status(200).json({
    success: true,
    message: "Static content SEO overrides deleted successfully.",
  });
}