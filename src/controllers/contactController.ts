import type { Request, Response } from "express";

import { createContactMessage } from "../services/contact/contactMessageService.ts";

export async function submitContactMessage(
  req: Request,
  res: Response
): Promise<void> {
  const {
    name,
    email,
    subject,
    message,
  } = req.body;

  await createContactMessage({
    name,
    email,
    subject,
    message,
  });

  res.status(201).json({
    success: true,
    message:
      "Your message has been sent successfully.",
  });
}