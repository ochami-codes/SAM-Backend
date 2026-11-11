export type HealthStatus = "operational" | "degraded" | "down";

export type ServiceStatus = "operational" | "down";

export interface ServiceHealth {
  status: ServiceStatus;
  responseTime: number | null;
  message: string;
}

export interface SystemHealth {
  status: HealthStatus;

  services: {
    backend: ServiceHealth;
    database: ServiceHealth;
    cloudinary: ServiceHealth;
    github: ServiceHealth;
  };

  system: {
    environment: string;
    uptime: number;
    checkedAt: string;
  };
}