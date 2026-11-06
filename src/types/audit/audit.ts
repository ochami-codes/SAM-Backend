import type { Types } from "mongoose";

export type AuditCategory =
  | "authentication"
  | "administrators"
  | "content"
  | "media"
  | "settings"
  | "contact"
  | "system";

export type AuditActor = {
  userId?: Types.ObjectId | undefined;
  fullName?: string | undefined;
  email?: string | undefined;
};

export type AuditResource = {
  type: string;
  id?: string | undefined;
};

export interface AuditLogInput {
  actor?: AuditActor | undefined;
  action: string;
  category: AuditCategory;
  resource?: AuditResource | undefined;
  description: string;
  metadata?: Record<string, unknown> | undefined;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}