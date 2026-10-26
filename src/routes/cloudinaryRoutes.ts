import { Router } from "express";

import {
  createCloudinaryUploadSignatureController, getCloudinaryMedia, deleteCloudinaryMediaController
} from "../controllers/cloudinaryController.ts";

import { authenticate } from "../middleware/authenticate.ts";
import { authorize } from "../middleware/authorize.ts";
import { asyncHandler } from "../middleware/asyncHandler.ts";

const router = Router();

router.post(
  "/upload-signature",
  authenticate,
  authorize("admin", "super_admin"),
  asyncHandler(createCloudinaryUploadSignatureController)
);

router.get(
  "/",
  authenticate,
  authorize("admin", "super_admin"),
  asyncHandler(getCloudinaryMedia)
);
router.delete(
  "/",
  authenticate,
  authorize("admin", "super_admin"),
  asyncHandler(deleteCloudinaryMediaController)
);

export default router;