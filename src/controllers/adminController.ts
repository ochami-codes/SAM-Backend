import type { Response } from "express";
import mongoose from "mongoose";
import { getClientIp } from "../utils/getClientIp.ts";
import type { AuthenticatedRequest } from "../middleware/authenticate.ts";

import { AppError } from "../errors/AppError.ts";

import { inviteAdmin } from "../services/admin/adminInvitationService.ts";
import { getAdministrators } from "../services/admin/getAdministratorsService.ts";
import { getPendingInvitations } from "../services/admin/getPendingInvitationsService.ts";
import { resendAdminInvitation } from "../services/admin/resendAdminInvitationService.ts";
import { cancelAdminInvitation } from "../services/admin/cancelAdminInvitationService.ts";
import { updateAdministratorStatus } from "../services/admin/updateAdministratorsStatusService.ts";

export async function inviteAdministrator(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { fullName, email } = req.body;

  const ipAddress = getClientIp(req);
  const userAgent = req.get("user-agent");

  await inviteAdmin(
    {
      fullName,
      email,
      invitedBy: req.user!.userId,
    },
    {
      ...(ipAddress !== undefined && { ipAddress }),
      ...(userAgent !== undefined && { userAgent }),
    }
  );

  res.status(201).json({
    success: true,
    message: "Administrator invitation sent successfully",
  });
}

export async function getAdministratorsController(
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const administrators = await getAdministrators();

  res.status(200).json({
    success: true,
    data: administrators,
  });
}

export async function getPendingInvitationsController(
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const invitations = await getPendingInvitations();

  res.status(200).json({
    success: true,
    data: invitations,
  });
}

export async function resendAdministratorInvitationController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { invitationId } = req.params;

  if (
    typeof invitationId !== "string" ||
    !mongoose.isValidObjectId(invitationId)
  ) {
    throw new AppError(
      "Invalid invitation ID",
      400,
      "VALIDATION_ERROR"
    );
  }

  const ipAddress = getClientIp(req);
  const userAgent = req.get("user-agent");

  await resendAdminInvitation(
    {
      invitationId,
      invitedBy: req.user!.userId,
    },
    {
      ...(ipAddress !== undefined && { ipAddress }),
      ...(userAgent !== undefined && { userAgent }),
    }
  );

  res.status(200).json({
    success: true,
    message: "Invitation resent successfully",
  });
}

export async function cancelAdministratorInvitationController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { invitationId } = req.params;

  if (
    typeof invitationId !== "string" ||
    !mongoose.isValidObjectId(invitationId)
  ) {
    throw new AppError(
      "Invalid invitation ID",
      400,
      "VALIDATION_ERROR"
    );
  }

  const ipAddress = getClientIp(req);
  const userAgent = req.get("user-agent");

  await cancelAdminInvitation(
    {
      invitationId,
      cancelledBy: req.user!.userId,
    },
    {
      ...(ipAddress !== undefined && { ipAddress }),
      ...(userAgent !== undefined && { userAgent }),
    }
  );

  res.status(200).json({
    success: true,
    message: "Invitation cancelled successfully",
  });
}

export async function updateAdministratorStatusController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { adminId } = req.params;
  const { isActive } = req.body;

  if (
    typeof adminId !== "string" ||
    !mongoose.isValidObjectId(adminId)
  ) {
    throw new AppError(
      "Invalid administrator ID",
      400,
      "VALIDATION_ERROR"
    );
  }

  if (typeof isActive !== "boolean") {
    throw new AppError(
      "isActive must be a boolean",
      400,
      "VALIDATION_ERROR"
    );
  }

const ipAddress = getClientIp(req);
const userAgent = req.get("user-agent");

await updateAdministratorStatus(
  {
    adminId,
    isActive,
    requestedBy: req.user!.userId,
  },
  {
    ...(ipAddress !== undefined && { ipAddress }),
    ...(userAgent !== undefined && { userAgent }),
  }
);

  res.status(200).json({
    success: true,
    message: `Administrator ${isActive ? "activated" : "suspended"} successfully`,
  });
}