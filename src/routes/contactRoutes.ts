import { Router } from "express";

import { submitContactMessage } from "../controllers/contactController.ts";
import { asyncHandler } from "../middleware/asyncHandler.ts";

const router = Router();

router.post(
  "/",
  asyncHandler(submitContactMessage)
);

export default router;