import mongoose, {
  Schema,
  type InferSchemaType,
  type Model,
} from "mongoose";

const securitySettingsSchema = new Schema(
  {
    // Singleton identifier: SAM has one global security policy.
    key: {
      type: String,
      required: true,
      unique: true,
      default: "global",
      immutable: true,
    },

    // Two-factor authentication policy
    requireTwoFactor: {
      type: Boolean,
      default: false,
    },

    // Login protection
    maxFailedLoginAttempts: {
      type: Number,
      default: 5,
      min: 3,
      max: 20,
    },

    accountLockoutDurationMinutes: {
      type: Number,
      default: 15,
      min: 1,
      max: 1440,
    },

    // Password policy
    minimumPasswordLength: {
      type: Number,
      default: 12,
      min: 8,
      max: 128,
    },

    maximumPasswordLength: {
      type: Number,
      default: 128,
      min: 32,
      max: 256,
    },

    // Track policy changes
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export type SecuritySettings = InferSchemaType<
  typeof securitySettingsSchema
>;

export const SecuritySettingsModel: Model<SecuritySettings> =
  (mongoose.models.SecuritySettings as Model<SecuritySettings>) ||
  mongoose.model<SecuritySettings>(
    "SecuritySettings",
    securitySettingsSchema
  );