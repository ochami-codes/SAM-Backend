import { Router } from "express";

import { inviteAdministrator } from "../controllers/adminController.ts";

import { authenticate } from "../middleware/authenticate.ts";
import { authorize } from "../middleware/authorize.ts";
import { asyncHandler } from "../middleware/asyncHandler.ts";

const router = Router();

router.post(
  "/invitations",
  authenticate,
  authorize("super_admin"),
  asyncHandler(inviteAdministrator)
);

export default router;