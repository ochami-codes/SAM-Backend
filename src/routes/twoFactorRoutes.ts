import { Router } from "express";

import {
  startTwoFactorSetupController,
  verifyTwoFactorSetupController,
  getTwoFactorStatusController,
  verifyTwoFactorLoginController,
} from "../controllers/twoFactorController.ts";

import {
  authenticateForTwoFactorEnrollment,
} from "../middleware/authenticate.ts";

import { asyncHandler } from "../middleware/asyncHandler.ts";
import { twoFactorLoginRateLimiter } from "../middleware/rateLimiters.ts";

const router = Router();

// Login challenge verification does not require an access token.
// The challenge token identifies the pending authentication.
router.post(
  "/verify-login",
  twoFactorLoginRateLimiter,
  asyncHandler(verifyTwoFactorLoginController)
);

// The remaining routes require authentication.
router.use(authenticateForTwoFactorEnrollment);

router.get(
  "/status",
  asyncHandler(getTwoFactorStatusController)
);

router.post(
  "/setup",
  asyncHandler(startTwoFactorSetupController)
);

router.post(
  "/verify-setup",
  asyncHandler(verifyTwoFactorSetupController)
);

export default router;