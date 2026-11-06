import { Router } from "express";

import { authenticate } from "../middleware/authenticate.ts";
import { authorize } from "../middleware/authorize.ts";
import { asyncHandler } from "../middleware/asyncHandler.ts";

import {
  getAuditLogsController,
  getAuditLogByIdController,
  getAuditStatsController,
} from "../controllers/auditController.ts";

const router = Router();

router.use(authenticate, authorize("super_admin"));

router.get("/", asyncHandler(getAuditLogsController));

router.get("/stats", authenticate, getAuditStatsController);

router.get(
  "/:auditLogId",
  asyncHandler(getAuditLogByIdController)
);


export default router;