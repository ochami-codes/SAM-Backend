import "dotenv/config";
import app from "./src/app.ts";
import { connectDatabase } from "./src/config/database.ts";
const PORT: number = parseInt(process.env.PORT || "5000", 10);

async function startServer(): Promise<void> {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`API server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
