import mongoose, {
  Schema,
  type InferSchemaType,
  type Model,
} from "mongoose";

const adminInvitationSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },

    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

/*
 * Automatically remove expired invitations.
 */
adminInvitationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export type AdminInvitation =
  InferSchemaType<typeof adminInvitationSchema>;

export const AdminInvitationModel: Model<AdminInvitation> =
  (mongoose.models.AdminInvitation as Model<AdminInvitation>) ||
  mongoose.model<AdminInvitation>(
    "AdminInvitation",
    adminInvitationSchema
  );
