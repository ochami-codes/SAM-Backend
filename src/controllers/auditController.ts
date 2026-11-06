import type { Request, Response } from "express";
import mongoose from "mongoose";
import { getAuditLogs, getAuditLogById } from "../services/audit/getAuditLogsService.ts";
import type { AuditCategory } from "../types/audit/audit.ts";
import type { AuthenticatedRequest } from "../middleware/authenticate.ts";
import { getAuditStats } from "../services/audit/auditStatsService.ts";

const AUDIT_CATEGORIES: AuditCategory[] = [
  "authentication","administrators","content","media","settings","system",
];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parsePositiveInt(value: unknown, fallback: number, max?: number): number | null {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
  const num = Number(value);
  if (!Number.isSafeInteger(num)) return null;
  if (max !== undefined && num > max) return null;
  return num;
}

function getOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function getParamString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  return undefined; // rejects string[] and everything else
}

function badRequest(res: Response, message: string) {
  res.status(400).json({ success: false, message });
}

export async function getAuditLogsController(req: Request, res: Response): Promise<void> {
  const page = parsePositiveInt(req.query.page, DEFAULT_PAGE);
  const limit = parsePositiveInt(req.query.limit, DEFAULT_LIMIT, MAX_LIMIT);
  if (page === null || limit === null) {
    badRequest(res, "Invalid pagination parameters.");
    return;
  }

  const rawCategory = getParamString(req.query.category);
  const category = rawCategory as AuditCategory | undefined;
  const action = getOptionalString(req.query.action);
  const adminId = getOptionalString(req.query.adminId);
  const startDate = getOptionalString(req.query.startDate);
  const endDate = getOptionalString(req.query.endDate);
  const search = getOptionalString(req.query.search);

  if (rawCategory && !AUDIT_CATEGORIES.includes(rawCategory as AuditCategory)) {
    badRequest(res, "Invalid audit category.");
    return;
  }
  if (adminId && !mongoose.isValidObjectId(adminId)) {
    badRequest(res, "Invalid administrator ID.");
    return;
  }
  if (startDate && Number.isNaN(Date.parse(startDate))) {
    badRequest(res, "Invalid start date.");
    return;
  }
  if (endDate && Number.isNaN(Date.parse(endDate))) {
    badRequest(res, "Invalid end date.");
    return;
  }
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    badRequest(res, "Start date cannot be after end date.");
    return;
  }
  if (search && search.length > 100) {
    badRequest(res, "Search query too long.");
    return;
  }

  const result = await getAuditLogs({
    page,
    limit,
    category,
    action,
    adminId,
    startDate,
    endDate,
    search,
  });

  res.status(200).json({ success: true, data: result.logs, pagination: result.pagination });
}

export async function getAuditLogByIdController(req: Request, res: Response): Promise<void> {
  const auditLogId = getParamString(req.params.auditLogId);

  if (!auditLogId || !mongoose.isValidObjectId(auditLogId)) {
    badRequest(res, "Invalid audit log ID.");
    return;
  }

  const auditLog = await getAuditLogById(auditLogId);
  if (!auditLog) {
    res.status(404).json({ success: false, message: "Audit log not found." });
    return;
  }

  res.status(200).json({ success: true, data: auditLog });
}


export async function getAuditStatsController(
  _req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const stats = await getAuditStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get audit statistics error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve audit statistics.",
    });
  }
}