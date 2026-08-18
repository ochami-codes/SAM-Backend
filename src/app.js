import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

/* -----------------------------------------
   Security
----------------------------------------- */

app.use(helmet());

/* -----------------------------------------
   CORS
----------------------------------------- */

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

/* -----------------------------------------
   Middleware
----------------------------------------- */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* -----------------------------------------
   Health Check
----------------------------------------- */

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

export default app;