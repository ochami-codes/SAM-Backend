import { Router } from "express";

import {
  getGlobalTwoFactorSettingsController,
  updateGlobalTwoFactorEnforcementController,
} from "../controllers/securitySettingsController.ts";

import { authenticate } from "../middleware/authenticate.ts";
import { authorize } from "../middleware/authorize.ts";
import { asyncHandler } from "../middleware/asyncHandler.ts";

const router = Router();

// All security settings routes require authentication.
router.use(authenticate);

// Read global 2FA enforcement settings.
router.get(
  "/2fa",
  authorize("super_admin", "admin"),
  asyncHandler(getGlobalTwoFactorSettingsController)
);

// Only Super Admin can change global enforcement.
router.patch(
  "/2fa",
  authorize("super_admin"),
  asyncHandler(updateGlobalTwoFactorEnforcementController)
);

export default router;