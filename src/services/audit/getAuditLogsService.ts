import mongoose from "mongoose";

import { AuditLogModel } from "../../models/AuditLog.ts";
import type { AuditLog } from "../../models/AuditLog.ts";
import type { AuditCategory } from "../../types/audit/audit.ts";

interface GetAuditLogsInput {
  page: number;
  limit: number;
  category?: AuditCategory | undefined;
  action?: string | undefined;
  adminId?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  search?: string | undefined;
}

interface AuditLogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface GetAuditLogsResult {
  logs: AuditLog[];
  pagination: AuditLogPagination;
}

// Escape special regex characters supplied by users.
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getAuditLogs({
  page,
  limit,
  category,
  action,
  adminId,
  startDate,
  endDate,
  search,
}: GetAuditLogsInput): Promise<GetAuditLogsResult> {
  // Build the MongoDB query conditions.
  const filter: Record<string, any> = {};

  if (category) {
    filter.category = category;
  }

  if (action) {
    filter.action = action.trim().toUpperCase();
  }

  if (adminId) {
    filter["actor.userId"] = new mongoose.Types.ObjectId(adminId);
  }

  // Date filtering.
  if (startDate || endDate) {
    filter.createdAt = {};

    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }

    if (endDate) {
      const end = new Date(endDate);

      // Include the entire day for date-only values.
      if (/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        end.setUTCHours(23, 59, 59, 999);
      }

      filter.createdAt.$lte = end;
    }
  }

  // Search across relevant audit-log fields.
  if (search?.trim()) {
    const safeSearch = new RegExp(
      escapeRegex(search.trim()),
      "i"
    );

    filter.$or = [
      { description: safeSearch },
      { "actor.fullName": safeSearch },
      { "actor.email": safeSearch },
      { action: safeSearch },
      { "resource.type": safeSearch },
      { "resource.id": safeSearch },
    ];
  }

  // Calculate pagination offset.
  const skip = (page - 1) * limit;

  // Fetch records and total count concurrently.
  const [logs, total] = await Promise.all([
    AuditLogModel.find(filter as any)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    AuditLogModel.countDocuments(filter as any),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    logs: logs as AuditLog[],
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export async function getAuditLogById(
  auditLogId: string
): Promise<AuditLog | null> {
  const auditLog = await AuditLogModel.findById(auditLogId).lean();

  return auditLog as AuditLog | null;
}