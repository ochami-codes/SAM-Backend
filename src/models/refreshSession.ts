import mongoose, {
  Schema,
  type InferSchemaType,
  type Model,
} from "mongoose";

const refreshSessionSchema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index for automatic expiration
refreshSessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export type RefreshSession =
  InferSchemaType<typeof refreshSessionSchema>;

export const RefreshSessionModel: Model<RefreshSession> =
  (mongoose.models.RefreshSession as Model<RefreshSession>) ||
  mongoose.model<RefreshSession>(
    "RefreshSession",
    refreshSessionSchema
  );
