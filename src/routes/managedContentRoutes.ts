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

const router = Router();

router.use(authenticate);
router.use(authorize("admin", "super_admin"));

router.get(
  "/",
  asyncHandler(listManagedContentController)
);

router.post(
  "/",
  asyncHandler(createManagedContentController)
);

router.get(
  "/:section/:category/:slug",
  asyncHandler(getManagedContentController)
);

router.get(
  "/:section/:slug",
  asyncHandler(getManagedContentController)
);

router.put(
  "/:section/:category/:slug",
  asyncHandler(updateManagedContentController)
);

router.put(
  "/:section/:slug",
  asyncHandler(updateManagedContentController)
);

router.delete(
  "/:section/:category/:slug",
  asyncHandler(deleteManagedContentController)
);

router.delete(
  "/:section/:slug",
  asyncHandler(deleteManagedContentController)
);

router.patch(
  "/:section/:category/:slug/publish",
  asyncHandler(publishManagedContentController)
);

router.patch(
  "/:section/:slug/publish",
  asyncHandler(publishManagedContentController)
);

router.patch(
  "/:section/:category/:slug/unpublish",
  asyncHandler(unpublishManagedContentController)
);

router.patch(
  "/:section/:slug/unpublish",
  asyncHandler(unpublishManagedContentController)
);

export default router;
