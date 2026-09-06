import mongoose from "mongoose";

export async function connectDatabase(): Promise<void> {
  try {
    const uri: string = process.env.MONGODB_URI ?? "";

    if (!uri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(uri);

    console.log("MongoDB connected");
  } catch (error) {
    if (error instanceof Error) {
      console.error("MongoDB connection failed:", error.message);
    } else {
      console.error("MongoDB connection failed with unknown error:", error);
    }
    process.exit(1);
  }
}

