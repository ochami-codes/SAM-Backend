import express from "express";
import type { Application, Request, Response } from "express";
import cors from "cors";
import type { CorsOptions } from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.ts";
import adminRoutes from "./routes/adminRoutes.ts";
import contentAdminRoutes from "./routes/contentAdminRoutes.ts";
import managedContentRoutes from "./routes/managedContentRoutes.ts";
import contactRoutes from "./routes/contactRoutes.ts";
import contactMessageAdminRoutes from "./routes/contactMessageAdminRoutes.ts";
import cloudinaryRoutes from "./routes/cloudinaryRoutes.ts";
import { errorHandler } from "./middleware/errorHandler.ts";
import managedContentPublicRoutes from "./routes/managedContentPublicRoutes.ts";
const app: Application = express();
app.use(cookieParser());

/* -----------------------------------------
   Security
----------------------------------------- */
app.use(helmet());

/* -----------------------------------------
   CORS
----------------------------------------- */
/* -----------------------------------------
   CORS - Fixed for second-advent-ministries.co.ke
----------------------------------------- */
const allowedOrigins = [
  "https://second-advent-ministries.co.ke",
  "https://www.second-advent-ministries.co.ke",
  "http://localhost:3000",
  "http://localhost:5173"
];

// If you have FRONTEND_URL in Render env, include it too
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // <- Fixes Preflight

/* -----------------------------------------
   Middleware
----------------------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin/contact-messages", contactMessageAdminRoutes);
app.use("/api/content", managedContentPublicRoutes);
app.use("/api/admin/content", contentAdminRoutes);
app.use("/api/admin/managed-content", managedContentRoutes);
app.use("/api/media", cloudinaryRoutes);

/* -----------------------------------------
   Health Check
----------------------------------------- */
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

app.use(errorHandler);

export default app;
