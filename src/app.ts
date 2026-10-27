import express from "express";
import type { Application, Request, Response } from "express";
import cors from "cors";
import type { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";

import { errorHandler } from "./middleware/errorHandler.ts";

import authRoutes from "./routes/authRoutes.ts";
import adminRoutes from "./routes/adminRoutes.ts";
import contactRoutes from "./routes/contactRoutes.ts";
import contactMessageAdminRoutes from "./routes/contactMessageAdminRoutes.ts";
import contentAdminRoutes from "./routes/contentAdminRoutes.ts";
import managedContentRoutes from "./routes/managedContentRoutes.ts";
import managedContentPublicRoutes from "./routes/managedContentPublicRoutes.ts";
import cloudinaryRoutes from "./routes/cloudinaryRoutes.ts";

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
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin/contact-messages", contactMessageAdminRoutes);
app.use("/api/content", managedContentPublicRoutes);
app.use("/api/admin/content", contentAdminRoutes);
app.use("/api/admin/managed-content", managedContentRoutes);
app.use("/api/media", cloudinaryRoutes);

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

