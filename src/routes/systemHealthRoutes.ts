import { Router } from "express";

import { getSystemHealthController } from "../controllers/systemHealthController.ts";

import { authenticate } from "../middleware/authenticate.ts";
import { authorize } from "../middleware/authorize.ts";
import { asyncHandler } from "../middleware/asyncHandler.ts";

const router = Router();

router.use(authenticate, authorize("super_admin"));

router.get("/", asyncHandler(getSystemHealthController));

export default router;