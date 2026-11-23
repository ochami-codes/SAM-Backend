import { Router } from "express";

import { authenticate } from "../middleware/authenticate.ts";
import { authorize } from "../middleware/authorize.ts";
import { asyncHandler } from "../middleware/asyncHandler.ts";

import {
  getSeoSettingsController,
  updateSeoSettingsController,
} from "../controllers/seo/seoSettingsController.ts";

import {
  getStaticContentSeoController,
  upsertStaticContentSeoController,
  deleteStaticContentSeoController,
} from "../controllers/seo/staticContentSeoController.ts";

import {
  getManagedContentSeoController,
  updateManagedContentSeoController,
  deleteManagedContentSeoController,
} from "../controllers/seo/managedContentSeoController.ts";

import {
  getCategorySeoController,
  updateCategorySeoController,
  deleteCategorySeoController,
} from "../controllers/seo/categorySeoController.ts";

const router = Router();

// All SEO management endpoints require authentication and admin privileges.
router.use(authenticate);
router.use(authorize("super_admin", "admin"));

// Global SEO settings
router.get(
  "/settings",
  asyncHandler(getSeoSettingsController)
);

router.put(
  "/settings",
  asyncHandler(updateSeoSettingsController)
);

// Category SEO settings
router.get(
  "/categories/:section/:category",
  asyncHandler(getCategorySeoController)
);

router.put(
  "/categories",
  asyncHandler(updateCategorySeoController)
);

router.delete(
  "/categories/:section/:category",
  asyncHandler(deleteCategorySeoController)
);

// Static MDX content SEO
router.get(
  "/static/:section/:slug",
  asyncHandler(getStaticContentSeoController)
);

router.put(
  "/static",
  asyncHandler(upsertStaticContentSeoController)
);

router.delete(
  "/static/:section/:slug",
  asyncHandler(deleteStaticContentSeoController)
);

// Managed content SEO
router.get(
  "/managed/:section/:slug",
  asyncHandler(getManagedContentSeoController)
);

router.put(
  "/managed",
  asyncHandler(updateManagedContentSeoController)
);

router.delete(
  "/managed/:section/:slug",
  asyncHandler(deleteManagedContentSeoController)
);

export default router;