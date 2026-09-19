import mongoose from "mongoose";

import { ContactMessageModel } from "../../models/ContactMessage.ts";
import { AppError } from "../../errors/AppError.ts";

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
  adminId: string
): Promise<void> {
  const message =
    await ContactMessageModel.findById(messageId);

  if (!message) {
    throw new AppError(
      "Contact message not found",
      404,
      "CONTACT_MESSAGE_NOT_FOUND"
    );
  }

  message.status = "read";
  message.readAt = new Date();
  message.readBy =
    new mongoose.Types.ObjectId(adminId);

  await message.save();
}

export async function archiveContactMessage(
  messageId: string
): Promise<void> {
  const message =
    await ContactMessageModel.findById(messageId);

  if (!message) {
    throw new AppError(
      "Contact message not found",
      404,
      "CONTACT_MESSAGE_NOT_FOUND"
    );
  }

  message.status = "archived";

  await message.save();
}