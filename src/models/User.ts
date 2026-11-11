import mongoose, {
  Schema,
  type InferSchemaType,
  type HydratedDocument,
  type Model,
} from "mongoose";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

     profileImage: {
  type: String,
  default: null,
},

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["super_admin", "admin"],
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    mustChangePassword: {
      type: Boolean,
      default: false,
    },

    // Two-factor authentication
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    twoFactorSecretEncrypted: {
      type: String,
      default: null,
      select: false,
    },

    pendingTwoFactorSecretEncrypted: {
      type: String,
      default: null,
      select: false,
    },

    pendingTwoFactorSecretExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },

    recoveryCodeHashes: {
      type: [String],
      default: [],
      select: false,
    },

    twoFactorEnabledAt: {
      type: Date,
      default: null,
    },

    // Authentication security
    authVersion: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof userSchema>;

export type UserDocument = HydratedDocument<User>;

export const UserModel: Model<User> =
  (mongoose.models.User as Model<User>) ||
  mongoose.model<User>("User", userSchema);