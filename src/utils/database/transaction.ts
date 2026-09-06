import mongoose, {
  type ClientSession,
} from "mongoose";

export async function withTransaction<T>(
  callback: (session: ClientSession) => Promise<T>
): Promise<T> {
  const session = await mongoose.startSession();

  try {
    return await session.withTransaction(
      async () => {
        return callback(session);
      }
    );
  } finally {
    await session.endSession();
  }
}