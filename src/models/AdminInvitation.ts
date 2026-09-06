import mongoose, {
  Schema,
  type InferSchemaType,
} from "mongoose";

const adminInvitationSchema = new Schema(
  {
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

export const AdminInvitationModel =
  mongoose.models.AdminInvitation ||
  mongoose.model(
    "AdminInvitation",
    adminInvitationSchema
  );