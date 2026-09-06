import express from "express";
import type { Application, Request, Response } from "express";
import cors from "cors";
import type { CorsOptions } from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.ts";
import adminRoutes from "./routes/adminRoutes.ts";
import { errorHandler } from "./middleware/errorHandler.ts";
const app: Application = express();
app.use(cookieParser());

/* -----------------------------------------
   Security
----------------------------------------- */
app.use(helmet());

/* -----------------------------------------
   CORS
----------------------------------------- */
const corsOptions: CorsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));

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
