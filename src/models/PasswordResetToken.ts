import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const passwordResetTokenSchema = new Schema(
  {
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
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Infer schema type
export type PasswordResetToken = InferSchemaType<typeof passwordResetTokenSchema>;

// Bind type to model
export const PasswordResetTokenModel: Model<PasswordResetToken> =
  (mongoose.models.PasswordResetToken as Model<PasswordResetToken>) ||
  mongoose.model<PasswordResetToken>(
    "PasswordResetToken",
    passwordResetTokenSchema
  );
