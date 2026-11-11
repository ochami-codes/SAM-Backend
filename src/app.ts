import express from "express";
import type { Application, Request, Response } from "express";
import cors from "cors";
import type { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";

import { errorHandler } from "./middleware/errorHandler.ts";

import authRoutes from "./routes/authRoutes.ts";
import twoFactorRoutes from "./routes/twoFactorRoutes.ts";
import adminRoutes from "./routes/adminRoutes.ts";
import contactRoutes from "./routes/contactRoutes.ts";
import contactMessageAdminRoutes from "./routes/contactMessageAdminRoutes.ts";
import contentAdminRoutes from "./routes/contentAdminRoutes.ts";
import managedContentRoutes from "./routes/managedContentRoutes.ts";
import managedContentPublicRoutes from "./routes/managedContentPublicRoutes.ts";
import cloudinaryRoutes from "./routes/cloudinaryRoutes.ts";
import auditRoutes from "./routes/auditRoutes.ts";
import systemHealthRoutes from "./routes/systemHealthRoutes.ts";
import securitySettingsRoutes from "./routes/securitySettingsRoutes.ts";
import profileRoutes from "./routes/profileRoutes.ts";

const app: Application = express();

/* Security */
app.use(helmet());

/* CORS */
const allowedOrigins = [
  "https://second-advent-ministries.co.ke",
  "https://www.second-advent-ministries.co.ke",
  "http://localhost:3000",
  "http://localhost:5173",
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    console.warn(`CORS blocked origin: ${origin}`);
    callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
  ],
};

app.use(cors(corsOptions));

/* Request Parsing */
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Request Logging */
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* API Routes */
app.use("/api/auth", authRoutes);
app.use("/api/auth/2fa", twoFactorRoutes);

// Specific admin routes first
app.use("/api/admin/contact-messages", contactMessageAdminRoutes);
app.use("/api/admin/content", contentAdminRoutes);
app.use("/api/admin/managed-content", managedContentRoutes);
app.use("/api/admin/system/health", systemHealthRoutes);
app.use("/api/admin/security-settings", securitySettingsRoutes);

// General admin routes last
app.use("/api/admin", adminRoutes);

app.use("/api/contact", contactRoutes);
app.use("/api/content", managedContentPublicRoutes);
app.use("/api/media", cloudinaryRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/profile", profileRoutes);

/* Health Check */
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

/* Error Handling */
app.use(errorHandler);

export default app;