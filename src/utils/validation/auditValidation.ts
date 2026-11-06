import mongoose from "mongoose";
import { isIP } from "node:net";
import { z } from "zod";

import { AUDIT_ACTIONS } from "../../constants/auditActions.ts";

const auditCategories = [
  "authentication",
  "administrators",
  "content",
  "media",
  "settings",
  "contact",
  "system",
] as const;

// Keys that must never appear in audit metadata.
const SENSITIVE_KEY_PATTERN =
  /password|secret|token|authorization|cookie|api[_-]?key|credential|private[_-]?key/i;

const MAX_METADATA_SIZE = 10_000;
const MAX_METADATA_DEPTH = 5;

function inspectMetadata(
  value: unknown,
  ctx: z.RefinementCtx,
  path: (string | number)[] = [],
  depth = 0,
  visited = new WeakSet<object>()
): void {
  if (depth > MAX_METADATA_DEPTH) {
    ctx.addIssue({
      code: "custom",
      path,
      message: "Metadata exceeds the maximum nesting depth.",
    });

    return;
  }

  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      ctx.addIssue({
        code: "custom",
        path,
        message: "Metadata cannot contain non-finite numbers.",
      });
    }

    return;
  }

  if (Array.isArray(value)) {
    if (visited.has(value)) {
      ctx.addIssue({
        code: "custom",
        path,
        message: "Circular references are not allowed in metadata.",
      });

      return;
    }

    visited.add(value);

    value.forEach((item, index) => {
      inspectMetadata(
        item,
        ctx,
        [...path, index],
        depth + 1,
        visited
      );
    });

    return;
  }

  if (typeof value === "object" && value !== null) {
    if (
      Object.getPrototypeOf(value) !== Object.prototype &&
      Object.getPrototypeOf(value) !== null
    ) {
      ctx.addIssue({
        code: "custom",
        path,
        message: "Metadata must contain plain JSON objects.",
      });

      return;
    }

    if (visited.has(value)) {
      ctx.addIssue({
        code: "custom",
        path,
        message: "Circular references are not allowed in metadata.",
      });

      return;
    }

    visited.add(value);

    for (const [key, nestedValue] of Object.entries(value)) {
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        ctx.addIssue({
          code: "custom",
          path: [...path, key],
          message: `Sensitive metadata key "${key}" is not allowed.`,
        });

        continue;
      }

      inspectMetadata(
        nestedValue,
        ctx,
        [...path, key],
        depth + 1,
        visited
      );
    }

    return;
  }

  ctx.addIssue({
    code: "custom",
    path,
    message: "Metadata contains an unsupported value.",
  });
}

const metadataSchema = z
  .record(z.string(), z.unknown())
  .superRefine((metadata, ctx) => {
    inspectMetadata(metadata, ctx);

    let serialized: string;

    try {
      serialized = JSON.stringify(metadata);
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "Metadata must be serializable.",
      });

      return;
    }

    if (serialized.length > MAX_METADATA_SIZE) {
      ctx.addIssue({
        code: "custom",
        message: "Metadata exceeds the maximum allowed size.",
      });
    }
  });

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "Invalid MongoDB ObjectId.")
  .transform((id) => new mongoose.Types.ObjectId(id));

export const auditLogInputSchema = z
  .object({
    actor: z
      .object({
        userId: z
          .union([
            z.instanceof(mongoose.Types.ObjectId),
            objectIdSchema,
          ])
          .optional(),

        fullName: z.string().trim().min(2).max(100).optional(),

        email: z.string().trim().email().max(254).optional(),
      })
      .strict()
      .optional(),

    action: z.enum(AUDIT_ACTIONS),

    category: z.enum(auditCategories),

    resource: z
      .object({
        type: z.string().trim().min(1).max(50),

        id: z.string().trim().max(100).optional(),
      })
      .strict()
      .optional(),

    description: z.string().trim().min(1).max(500),

    metadata: metadataSchema.optional(),

    ipAddress: z
      .string()
      .refine((ip) => isIP(ip) !== 0, "Invalid IP address.")
      .optional(),

    userAgent: z.string().max(1000).optional(),
  })
  .strict();

export type ValidatedAuditLogInput = z.infer<
  typeof auditLogInputSchema
>;