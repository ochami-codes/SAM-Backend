import { Router } from "express";

import { authenticate } from "../middleware/authenticate.ts";
import { asyncHandler } from "../middleware/asyncHandler.ts";

import { updateProfileController } from "../controllers/profile/updateProfileController.ts";
import { createProfileUploadSignatureController } from "../controllers/profile/createProfileUploadSignatureController.ts";
import { confirmProfilePhotoUploadController } from "../controllers/profile/confirmProfilePhotoUploadController.ts";

const router = Router();

// All profile routes require authentication.
router.use(authenticate);

// Update personal information.
router.patch(
  "/",
  asyncHandler(updateProfileController)
);

// Generate a signed Cloudinary upload configuration.
router.post(
  "/upload-signature",
  asyncHandler(createProfileUploadSignatureController)
);

// Verify and save the uploaded profile photo.
router.post(
  "/confirm-upload",
  asyncHandler(confirmProfilePhotoUploadController)
);

export default router;