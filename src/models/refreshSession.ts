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
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },

    deviceName: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "Unknown device",
    },

    ipAddress: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
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

// Automatically remove expired sessions.
refreshSessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

// Efficiently retrieve sessions belonging to a user.
refreshSessionSchema.index({
  userId: 1,
  expiresAt: 1,
});

export type RefreshSession =
  InferSchemaType<typeof refreshSessionSchema>;

export const RefreshSessionModel: Model<RefreshSession> =
  (mongoose.models.RefreshSession as Model<RefreshSession>) ||
  mongoose.model<RefreshSession>(
    "RefreshSession",
    refreshSessionSchema
  );
