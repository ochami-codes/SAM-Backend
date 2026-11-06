import mongoose from "mongoose";

import { ContactMessageModel } from "../../models/ContactMessage.ts";
import { AppError } from "../../errors/AppError.ts";

import { createAuditLog } from "../audit/auditCreationService.ts";
import { AUDIT_ACTIONS } from "../../constants/auditActions.ts";

export interface ContactMessageAuditContext {
  actor?: {
    fullName?: string | undefined;
    email?: string | undefined;
  };
  ipAddress?: string;
  userAgent?: string;
}

export async function getContactMessages() {
  return ContactMessageModel.find()
    .sort({ createdAt: -1 })
    .lean();
}

export async function getContactMessageById(
  messageId: string
) {
  const message =
    await ContactMessageModel.findById(messageId).lean();

  if (!message) {
    throw new AppError(
      "Contact message not found",
      404,
      "CONTACT_MESSAGE_NOT_FOUND"
    );
  }

  return message;
}

export async function markContactMessageAsRead(
  messageId: string,
  adminId: string,
  auditContext: ContactMessageAuditContext = {}
): Promise<void> {
  const message = await ContactMessageModel.findById(messageId);

  if (!message) {
    throw new AppError(
      "Contact message not found",
      404,
      "CONTACT_MESSAGE_NOT_FOUND"
    );
  }

  if (message.status === "read") {
    return;
  }

  if (message.status === "archived") {
    throw new AppError(
      "Archived messages cannot be marked as read",
      409,
      "CONTACT_MESSAGE_ALREADY_ARCHIVED"
    );
  }

  const previousStatus = message.status;

  message.status = "read";
  message.readAt = new Date();
  message.readBy = new mongoose.Types.ObjectId(adminId);

  await message.save();

  await createAuditLog({
    actor: {
      userId: new mongoose.Types.ObjectId(adminId),
      ...auditContext.actor,
    },
    action: AUDIT_ACTIONS.CONTACT_MESSAGE_READ,
    category: "contact",
    resource: {
      type: "contact_message",
      id: message._id.toString(),
    },
    description: "Contact message marked as read",
    metadata: {
      previousStatus,
      newStatus: "read",
    },
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });
}
export async function archiveContactMessage(
  messageId: string,
  adminId: string,
  auditContext: ContactMessageAuditContext = {}
): Promise<void> {
  const message = await ContactMessageModel.findById(messageId);

  if (!message) {
    throw new AppError(
      "Contact message not found",
      404,
      "CONTACT_MESSAGE_NOT_FOUND"
    );
  }

  if (message.status === "archived") {
    return;
  }

  const previousStatus = message.status;

  message.status = "archived";

  await message.save();

  await createAuditLog({
    actor: {
      userId: new mongoose.Types.ObjectId(adminId),
      ...auditContext.actor,
    },
    action: AUDIT_ACTIONS.CONTACT_MESSAGE_ARCHIVED,
    category: "contact",
    resource: {
      type: "contact_message",
      id: message._id.toString(),
    },
    description: "Contact message archived",
    metadata: {
      previousStatus,
      newStatus: "archived",
    },
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });
}