import { Router } from "express";

// Middleware
import { authenticate } from "../middleware/authenticate.ts";
import { authorize } from "../middleware/authorize.ts";
import { asyncHandler } from "../middleware/asyncHandler.ts";

// Managed content controllers
import {
  listManagedContentController,
  getManagedContentController,
  createManagedContentController,
  updateManagedContentController,
  deleteManagedContentController,
  publishManagedContentController,
  unpublishManagedContentController,
} from "../controllers/content/managedContentAdminController.ts";

// Content metadata controllers
import {
  createManagedContentMetadataController,
  getAllManagedContentMetadataController,
  updateManagedContentMetadataController,
  deleteManagedContentMetadataController,
} from "../controllers/content/managedContentMetadataController.ts";

const router = Router();

/* =====================================================
   AUTHENTICATION & AUTHORIZATION
===================================================== */

router.use(authenticate);
router.use(authorize("admin", "super_admin"));

/* =====================================================
   CONTENT METADATA
===================================================== */

// Retrieve all custom sections and categories
router.get(
  "/metadata",
  asyncHandler(getAllManagedContentMetadataController)
);

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

// Delete a custom section
router.delete(
  "/metadata/sections/:slug",
  asyncHandler(deleteManagedContentMetadataController)
);

// Delete a custom category
router.delete(
  "/metadata/sections/:sectionSlug/categories/:slug",
  asyncHandler(deleteManagedContentMetadataController)
);

/* =====================================================
   MANAGED CONTENT
===================================================== */

// List content
router.get(
  "/",
  asyncHandler(listManagedContentController)
);

// Create content
router.post(
  "/",
  asyncHandler(createManagedContentController)
);

// Retrieve content
router.get(
  "/:section/:category/:slug",
  asyncHandler(getManagedContentController)
);

router.get(
  "/:section/:slug",
  asyncHandler(getManagedContentController)
);

// Update content
router.put(
  "/:section/:category/:slug",
  asyncHandler(updateManagedContentController)
);

router.put(
  "/:section/:slug",
  asyncHandler(updateManagedContentController)
);

// Delete content
router.delete(
  "/:section/:category/:slug",
  asyncHandler(deleteManagedContentController)
);

router.delete(
  "/:section/:slug",
  asyncHandler(deleteManagedContentController)
);

// Publish content
router.patch(
  "/:section/:category/:slug/publish",
  asyncHandler(publishManagedContentController)
);

router.patch(
  "/:section/:slug/publish",
  asyncHandler(publishManagedContentController)
);

// Unpublish content
router.patch(
  "/:section/:category/:slug/unpublish",
  asyncHandler(unpublishManagedContentController)
);

router.patch(
  "/:section/:slug/unpublish",
  asyncHandler(unpublishManagedContentController)
);

export default router;