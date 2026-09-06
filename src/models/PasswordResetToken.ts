import mongoose, {
  Schema,
  type InferSchemaType,
} from "mongoose";

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

passwordResetTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export type PasswordResetToken =
  InferSchemaType<typeof passwordResetTokenSchema>;

export const PasswordResetTokenModel =
  mongoose.models.PasswordResetToken ||
  mongoose.model(
    "PasswordResetToken",
    passwordResetTokenSchema
  );