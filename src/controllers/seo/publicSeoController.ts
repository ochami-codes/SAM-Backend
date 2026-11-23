import type { Request, Response } from "express";

import {
  resolveContentSeoSchema,
  resolveSectionSeoSchema,
  resolveCategorySeoSchema,
} from "../../utils/validation/publicSeoValidation.ts";

import {
  resolveContentSeo,
  resolveSectionSeo,
} from "../../services/seo/seoService.ts";

import {
  resolveCategorySeo,
} from "../../services/seo/resolveCategorySeo.ts";

import { AppError } from "../../errors/AppError.ts";

export async function resolvePublicContentSeoController(
  req: Request,
  res: Response
): Promise<void> {
  const validation = resolveContentSeoSchema.safeParse(req.body);

  if (!validation.success) {
    throw new AppError(
      "Invalid content SEO information.",
      400,
      "VALIDATION_ERROR"
    );
  }

  const input = validation.data;

  const seo = await resolveContentSeo({
  section: input.section,
  slug: input.slug,
  title: input.title,
  source: input.source,

  ...(input.description !== undefined
    ? { description: input.description }
    : {}),

  ...(input.heroImage !== undefined
    ? { heroImage: input.heroImage }
    : {}),

  ...(input.seo !== undefined
    ? {
        seo: {
          ...(input.seo.title !== undefined
            ? { title: input.seo.title }
            : {}),

          ...(input.seo.description !== undefined
            ? { description: input.seo.description }
            : {}),

          ...(input.seo.image !== undefined
            ? { image: input.seo.image }
            : {}),
        },
      }
    : {}),
});

  res.status(200).json({
    success: true,
    data: seo,
  });
}

export async function resolvePublicSectionSeoController(
  req: Request,
  res: Response
): Promise<void> {
  const validation = resolveSectionSeoSchema.safeParse(req.body);

  if (!validation.success) {
    throw new AppError(
      "Invalid section SEO information.",
      400,
      "VALIDATION_ERROR"
    );
  }

  const input = validation.data;

  const seo = await resolveSectionSeo({
    section: input.section,
    title: input.title,
    ...(input.description !== undefined
      ? { description: input.description }
      : {}),
    ...(input.heroImage !== undefined
      ? { heroImage: input.heroImage }
      : {}),
  });

  res.status(200).json({
    success: true,
    data: seo,
  });
}

export async function resolvePublicCategorySeoController(
  req: Request,
  res: Response
): Promise<void> {
  const validation = resolveCategorySeoSchema.safeParse(req.body);

  if (!validation.success) {
    throw new AppError(
      "Invalid category SEO information.",
      400,
      "VALIDATION_ERROR"
    );
  }

  const input = validation.data;

  const seo = await resolveCategorySeo({
    section: input.section,
    category: input.category,
    title: input.title,
    ...(input.description !== undefined
      ? { description: input.description }
      : {}),
  });

  res.status(200).json({
    success: true,
    data: seo,
  });
}