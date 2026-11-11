import { Router } from "express";
import { authenticate } from "../middleware/authenticate.ts";
import {
     login,
     refresh,
     logout, 
     changeUserPassword,
     forgotPassword, 
     resetUserPassword,
     me as getCurrentUser,
     acceptAdminInvitations,
     getActiveSessionsController,
     revokeSessionController
    } from "../controllers/authController.ts";

import { asyncHandler } from "../middleware/asyncHandler.ts";
import { loginRateLimiter } from "../middleware/rateLimiters.ts";
import { revokeOtherSessionsController } from "../controllers/auth/revokeSessionsController.ts";

const router = Router();
        
router.post("/login", loginRateLimiter, asyncHandler(login));
router.post("/refresh", asyncHandler(refresh));
router.post("/logout", asyncHandler(logout));
router.post("/change-password", authenticate, asyncHandler(changeUserPassword));
router.post("/forgot-password", asyncHandler(forgotPassword));
router.post("/reset-password", asyncHandler(resetUserPassword));
router.get("/me", authenticate, asyncHandler(getCurrentUser));
router.post("/accept-invitation", asyncHandler(acceptAdminInvitations));
router.get(
  "/sessions",
  authenticate,
  asyncHandler(getActiveSessionsController)
);
// Active sessions
router.get(
  "/sessions",
  authenticate,
  asyncHandler(getActiveSessionsController)
);

// Revoke all other sessions
router.delete(
  "/sessions/others",
  authenticate,
  asyncHandler(revokeOtherSessionsController)
);

// Revoke a specific session
router.delete(
  "/sessions/:sessionId",
  authenticate,
  asyncHandler(revokeSessionController)
);  
export default router;