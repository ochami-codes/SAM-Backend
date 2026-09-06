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
     acceptAdminInvitations
    } from "../controllers/authController.ts";

import { asyncHandler } from "../middleware/asyncHandler.ts";

const router = Router();
        
router.post("/login", asyncHandler(login));
router.post("/refresh", asyncHandler(refresh));
router.post("/logout", asyncHandler(logout));
router.post("/change-password", authenticate, asyncHandler(changeUserPassword));
router.post("/forgot-password", asyncHandler(forgotPassword));
router.post("/reset-password", asyncHandler(resetUserPassword));
router.get("/me", authenticate, asyncHandler(getCurrentUser));
router.post("/accept-invitation", asyncHandler(acceptAdminInvitations));
export default router;