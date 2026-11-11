import { Router } from "express";

import {
  listPublishedManagedContentController,
} from "../controllers/content/managedContentPublicController.ts";

import {
  getPublishedArticleController,
  getPublishedManagedContentController,
} from "../controllers/content/getPublishedManagedContentController.ts";

import { getManagedContentMetadataController } from "../controllers/content/managedContentMetadataController.ts";
import { asyncHandler } from "../middleware/asyncHandler.ts";

const router = Router();

router.get(
  "/metadata",
  asyncHandler(getManagedContentMetadataController)
);

// Individual articles (without categories).
router.get(
  "/articles/:slug",
  asyncHandler(getPublishedArticleController)
);

// Published content lists.
router.get(
  "/:section",
  asyncHandler(listPublishedManagedContentController)
);

router.get(
  "/:section/:category",
  asyncHandler(listPublishedManagedContentController)
);

// Individual categorized content.
router.get(
  "/:section/:category/:slug",
  asyncHandler(getPublishedManagedContentController)
);

export default router;