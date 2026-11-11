import mongoose from "mongoose";
import cloudinary from "../../config/cloudinary.ts";
import { githubConfig } from "../../config/github.ts";
import { getGithubInstallationOctokit } from "../../utils/github/githubClient.ts";

import type {
  HealthStatus,
  ServiceHealth,
  SystemHealth,
} from "../../types/settings/systemHealth.ts";

type HealthCheck = () => Promise<void>;

async function checkService(
  name: string,
  check: HealthCheck,
  timeoutMs: number
): Promise<ServiceHealth> {
  const startTime = performance.now();

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    await Promise.race([
      check(),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`${name} health check timed out`));
        }, timeoutMs);
      }),
    ]);

    return {
      status: "operational",
      responseTime: Math.round(performance.now() - startTime),
      message: `${name} is operational`,
    };
  } catch (error) {
    console.error(`[SYSTEM HEALTH] ${name} check failed:`, error);

    const timedOut =
      error instanceof Error && error.message.includes("timed out");

    return {
      status: "down",
      responseTime: Math.round(performance.now() - startTime),
      message: timedOut
        ? `${name} health check timed out`
        : `${name} is unavailable`,
    };
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
/**
 * Checks whether the Express application is running.
 */
async function checkBackend(): Promise<ServiceHealth> {
  return {
    status: "operational",
    responseTime: 0,
    message: "Backend API is running",
  };
}

/**
 * Checks MongoDB connectivity using a native database ping.
 */
async function checkDatabase(): Promise<void> {
  const database = mongoose.connection.db;

  if (!database || mongoose.connection.readyState !== 1) {
    throw new Error("MongoDB is not connected");
  }

  await database.admin().ping();
}

/**
 * Checks Cloudinary connectivity.
 */
async function checkCloudinary(): Promise<void> {
  await cloudinary.api.ping();
}

/**
 * Checks GitHub installation access to the configured repository.
 */
async function checkGithub(): Promise<void> {
  if (!githubConfig.owner || !githubConfig.repo) {
    throw new Error("GitHub repository configuration is incomplete");
  }

  const octokit = await getGithubInstallationOctokit();

  await octokit.rest.repos.get({
    owner: githubConfig.owner,
    repo: githubConfig.repo,
  });
}

/**
 * Determines the overall system health.
 */
function determineOverallStatus(
  services: SystemHealth["services"]
): HealthStatus {
  const statuses = Object.values(services);

  const backendDown = services.backend.status === "down";

  if (backendDown) {
    return "down";
  }

  const hasUnavailableService = statuses.some(
    (service) => service.status === "down"
  );

  return hasUnavailableService ? "degraded" : "operational";
}

/**
 * Collects the health status of all SAM services.
 */
export async function getSystemHealth(): Promise<SystemHealth> {
const [
  backend,
  database,
  cloudinaryHealth,
  github,
] = await Promise.all([
  checkBackend(),
  checkService("MongoDB", checkDatabase, 3000),
  checkService("Cloudinary", checkCloudinary, 5000),
  checkService("GitHub", checkGithub, 5000),
]);

  const services = {
    backend,
    database,
    cloudinary: cloudinaryHealth,
    github,
  };

  return {
    status: determineOverallStatus(services),

    services,

    system: {
      environment: process.env.NODE_ENV ?? "development",
      uptime: Math.floor(process.uptime()),
      checkedAt: new Date().toISOString(),
    },
  };
}