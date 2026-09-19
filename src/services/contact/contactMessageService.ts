import { ContactMessageModel } from "../../models/ContactMessage.ts";

import {
  validateContactName,
  validateContactEmail,
  validateContactSubject,
  validateContactMessage,
} from "../../utils/validation/index.ts";

interface CreateContactMessageInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export async function createContactMessage({
  name,
  email,
  subject,
  message,
}: CreateContactMessageInput): Promise<void> {
  const validatedName =
    validateContactName(name);

  const validatedEmail =
    validateContactEmail(email);

  const validatedSubject =
    validateContactSubject(subject);

  const validatedMessage =
    validateContactMessage(message);

  await ContactMessageModel.create({
    name: validatedName,
    email: validatedEmail,
    ...(validatedSubject && {
      subject: validatedSubject,
    }),
    message: validatedMessage,
    status: "unread",
  });
}