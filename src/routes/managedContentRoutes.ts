import { Router } from "express";

import {
  listManagedContentController,
  getManagedContentController,
  createManagedContentController,
  updateManagedContentController,
  deleteManagedContentController,
  publishManagedContentController,
  unpublishManagedContentController,
} from "../controllers/managedContentAdminController.ts";

import { authenticate } from "../middleware/authenticate.ts";
import { authorize } from "../middleware/authorize.ts";
import { asyncHandler } from "../middleware/asyncHandler.ts";
import { createManagedContentMetadataController, getAllManagedContentMetadataController, updateManagedContentMetadataController } from "../controllers/managedContentMetadataController.ts";

const router = Router();

router.use(authenticate);
router.use(authorize("admin", "super_admin"));

/* -------------------- List -------------------- */

router.get(
  "/",
  asyncHandler(listManagedContentController)
);

/* -------------------- Create -------------------- */

router.post(
  "/",
  asyncHandler(createManagedContentController)
);

/* -------------------- Read -------------------- */

router.get(
  "/:section/:category/:slug",
  asyncHandler(getManagedContentController)
);

router.get(
  "/:section/:slug",
  asyncHandler(getManagedContentController)
);

/* -------------------- Update -------------------- */

router.put(
  "/:section/:category/:slug",
  asyncHandler(updateManagedContentController)
);

router.put(
  "/:section/:slug",
  asyncHandler(updateManagedContentController)
);

/* -------------------- Delete -------------------- */

router.delete(
  "/:section/:category/:slug",
  asyncHandler(deleteManagedContentController)
);

router.delete(
  "/:section/:slug",
  asyncHandler(deleteManagedContentController)
);

/* -------------------- Publish -------------------- */

router.patch(
  "/:section/:category/:slug/publish",
  asyncHandler(publishManagedContentController)
);

router.patch(
  "/:section/:slug/publish",
  asyncHandler(publishManagedContentController)
);

/* -------------------- Unpublish -------------------- */

router.patch(
  "/:section/:category/:slug/unpublish",
  asyncHandler(unpublishManagedContentController)
);

router.patch(
  "/:section/:slug/unpublish",
  asyncHandler(unpublishManagedContentController)
);

/* -------------------- Content Metadata -------------------- */

// Create a custom section or category
router.post(
  "/metadata",
  asyncHandler(createManagedContentMetadataController)
);

// Update a custom section
router.patch(
  "/metadata/sections/:slug",
  asyncHandler(updateManagedContentMetadataController)
);

// Update a custom category
router.patch(
  "/metadata/sections/:sectionSlug/categories/:slug",
  asyncHandler(updateManagedContentMetadataController)
);
/* -------------------- Content Metadata -------------------- */

// Retrieve all custom sections and categories
router.get(
  "/metadata",
  asyncHandler(getAllManagedContentMetadataController)
);
export default router;
