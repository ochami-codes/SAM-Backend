import type { Response } from "express";

import type { AuthenticatedRequest } from "../middleware/authenticate.ts";

import {
  validateManagedContentIdentifier,
  validateCreateManagedContentBody,
  validateUpdateManagedContentBody,
} from "../utils/validation/managedContentValidation.ts";

import {
  listManagedContent,
  getManagedContent,
  createManagedContent,
  updateManagedContent,
  deleteManagedContent,
  publishManagedContent,
  unpublishManagedContent,
} from "../services/content/managedContentService.ts";

import { AppError } from "../errors/AppError.ts";

export async function listManagedContentController(
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const content = await listManagedContent();

  res.status(200).json({
    success: true,
    data: content,
  });
}

export async function getManagedContentController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const identifier = validateManagedContentIdentifier(
    req.params.section,
    req.params.category,
    req.params.slug
  );

  const content = await getManagedContent(identifier);

  res.status(200).json({
    success: true,
    data: content,
  });
}

export async function createManagedContentController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new AppError(
      "Authentication required",
      401,
      "AUTHENTICATION_REQUIRED"
    );
  }

  const input = validateCreateManagedContentBody(
    req.body
  );

  const content = await createManagedContent(
    input,
    req.user.userId
  );

  res.status(201).json({
    success: true,
    data: content,
  });
}

export async function updateManagedContentController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new AppError(
      "Authentication required",
      401,
      "AUTHENTICATION_REQUIRED"
    );
  }

  const identifier = validateManagedContentIdentifier(
    req.params.section,
    req.params.category,
    req.params.slug
  );

  const input = validateUpdateManagedContentBody(
    req.body
  );

  const content = await updateManagedContent(
    identifier,
    input,
    req.user.userId
  );

  res.status(200).json({
    success: true,
    data: content,
  });
}

export async function deleteManagedContentController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const identifier = validateManagedContentIdentifier(
    req.params.section,
    req.params.category,
    req.params.slug
  );

  await deleteManagedContent(identifier);

  res.status(200).json({
    success: true,
    message: "Managed content deleted successfully",
  });
}

export async function publishManagedContentController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new AppError(
      "Authentication required",
      401,
      "AUTHENTICATION_REQUIRED"
    );
  }

  const identifier = validateManagedContentIdentifier(
    req.params.section,
    req.params.category,
    req.params.slug
  );

  const content = await publishManagedContent(
    identifier,
    req.user.userId
  );

  res.status(200).json({
    success: true,
    data: content,
  });
}

export async function unpublishManagedContentController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  if (!req.user) {
    throw new AppError(
      "Authentication required",
      401,
      "AUTHENTICATION_REQUIRED"
    );
  }

  const identifier = validateManagedContentIdentifier(
    req.params.section,
    req.params.category,
    req.params.slug
  );

  const content = await unpublishManagedContent(
    identifier,
    req.user.userId
  );

  res.status(200).json({
    success: true,
    data: content,
  });
}