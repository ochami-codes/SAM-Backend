import { Router } from "express";

import {
  listPublishedManagedContentController,
} from "../controllers/managedContentPublicController.ts";

import {
  getPublishedManagedContentController,
} from "../controllers/getPublishedManagedContentController.ts";

import {
  getManagedContentMetadataController,
} from "../controllers/managedContentMetadataController.ts";

import { asyncHandler } from "../middleware/asyncHandler.ts";

const router = Router();

/* -------------------- Metadata -------------------- */

router.get(
  "/metadata",
  asyncHandler(getManagedContentMetadataController)
);

/* -------------------- List -------------------- */

router.get(
  "/:section",
  asyncHandler(listPublishedManagedContentController)
);

/* -------------------- Category List -------------------- */

router.get(
  "/:section/:category",
  asyncHandler(listPublishedManagedContentController)
);

/* -------------------- Read -------------------- */

router.get(
  "/:section/:category/:slug",
  asyncHandler(getPublishedManagedContentController)
);

router.get(
  "/:section/:slug",
  asyncHandler(getPublishedManagedContentController)
);

export default router;