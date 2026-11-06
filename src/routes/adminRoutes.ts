import { Router } from "express";

import {
  inviteAdministrator,
  getAdministratorsController,
  getPendingInvitationsController,
  resendAdministratorInvitationController,
  cancelAdministratorInvitationController,
  updateAdministratorStatusController,
} from "../controllers/adminController.ts";

import { authenticate } from "../middleware/authenticate.ts";
import { authorize } from "../middleware/authorize.ts";
import { asyncHandler } from "../middleware/asyncHandler.ts";

const router = Router();

router.use(authenticate, authorize("super_admin"));

router.get("/", asyncHandler(getAdministratorsController));

router.get(
  "/invitations",
  asyncHandler(getPendingInvitationsController)
);

router.post(
  "/invitations",
  asyncHandler(inviteAdministrator)
);

router.post(
  "/invitations/:invitationId/resend",
  asyncHandler(resendAdministratorInvitationController)
);

router.delete(
  "/invitations/:invitationId",
  asyncHandler(cancelAdministratorInvitationController)
);

router.patch(
  "/:adminId/status",
  asyncHandler(updateAdministratorStatusController)
);

export default router;