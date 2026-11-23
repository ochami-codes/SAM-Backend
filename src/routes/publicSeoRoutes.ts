import { Router } from "express";

import { asyncHandler } from "../middleware/asyncHandler.ts";

import {
  resolvePublicContentSeoController,
  resolvePublicSectionSeoController,
  resolvePublicCategorySeoController,
} from "../controllers/seo/publicSeoController.ts";

const router = Router();

// Individual content metadata
router.post(
  "/content",
  asyncHandler(resolvePublicContentSeoController)
);

// Section landing-page metadata
router.post(
  "/section",
  asyncHandler(resolvePublicSectionSeoController)
);

// Category landing-page metadata
router.post(
  "/category",
  asyncHandler(resolvePublicCategorySeoController)
);

export default router;