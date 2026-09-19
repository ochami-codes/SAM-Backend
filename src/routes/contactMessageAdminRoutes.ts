import { Router } from "express";

import {
  getMessages,
  getMessage,
  markMessageAsRead,
  archiveMessage,
} from "../controllers/contactMessageAdminController.ts";

import { authenticate } from "../middleware/authenticate.ts";
import { authorize } from "../middleware/authorize.ts";
import { asyncHandler } from "../middleware/asyncHandler.ts";

const router = Router();

router.use(
  authenticate,
  authorize("admin", "super_admin")
);

router.get(
  "/",
  asyncHandler(getMessages)
);

router.get(
  "/:id",
  asyncHandler(getMessage)
);

router.patch(
  "/:id/read",
  asyncHandler(markMessageAsRead)
);

router.patch(
  "/:id/archive",
  asyncHandler(archiveMessage)
);

export default router;