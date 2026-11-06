import { AuditLogModel } from "../../models/AuditLog.ts";
import type { AuditCategory } from "../../types/audit/audit.ts";

const AUDIT_CATEGORIES: AuditCategory[] = [
  "authentication",
  "administrators",
  "content",
  "media",
  "settings",
  "contact",
  "system",
];

interface AuditStats {
  total: number;
  categories: Record<AuditCategory, number>;
}

interface AuditCategoryAggregation {
  _id: AuditCategory;
  count: number;
}

export async function getAuditStats(): Promise<AuditStats> {
  const results = await AuditLogModel.aggregate<AuditCategoryAggregation>([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  const categories = Object.fromEntries(
    AUDIT_CATEGORIES.map((category) => [category, 0]),
  ) as Record<AuditCategory, number>;

  let total = 0;

  for (const result of results) {
    categories[result._id] = result.count;
    total += result.count;
  }

  return {
    total,
    categories,
  };
}