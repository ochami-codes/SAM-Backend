import type { Response } from "express";
import  { validateObjectId } from "../utils/validation/index.ts";
import type {
  AuthenticatedRequest,
} from "../middleware/authenticate.ts";

import { AppError } from "../errors/AppError.ts";

import {
  getContactMessages,
  getContactMessageById,
  markContactMessageAsRead,
  archiveContactMessage,
} from "../services/contact/contactMessageAdminService.ts";

export async function getMessages(
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const messages = await getContactMessages();

  res.status(200).json({
    success: true,
    messages,
  });
}

export async function getMessage(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const id = validateObjectId(
  req.params.id,
  "Contact message ID"
);

  if (!id) {
    throw new AppError(
      "Contact message ID is required",
      400,
      "VALIDATION_ERROR"
    );
  }

  const message =
    await getContactMessageById(id);

  res.status(200).json({
    success: true,
    message,
  });
}

export async function markMessageAsRead(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
    const id = validateObjectId(
  req.params.id,
  "Contact message ID"
);

  if (!id) {
    throw new AppError(
      "Contact message ID is required",
      400,
      "VALIDATION_ERROR"
    );
  }

  if (!req.user) {
    throw new AppError(
      "Authentication required",
      401,
      "AUTHENTICATION_REQUIRED"
    );
  }

  await markContactMessageAsRead(
    id,
    req.user.userId
  );

  res.status(200).json({
    success: true,
    message:
      "Contact message marked as read.",
  });
}

export async function archiveMessage(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const id = validateObjectId(
  req.params.id,
  "Contact message ID"
);

  if (!id) {
    throw new AppError(
      "Contact message ID is required",
      400,
      "VALIDATION_ERROR"
    );
  }

  await archiveContactMessage(id);

  res.status(200).json({
    success: true,
    message:
      "Contact message archived successfully.",
  });
}