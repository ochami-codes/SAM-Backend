import type { Request, Response } from "express";
import { getSystemHealth } from "../services/system/systemHealthService.ts";

export async function getSystemHealthController(
  _req: Request,
  res: Response
): Promise<void> {
  const health = await getSystemHealth();

  res.status(200).json({
    success: true,
    data: health,
  });
}