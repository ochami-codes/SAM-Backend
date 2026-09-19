import mongoose, {
  Schema,
  type InferSchemaType,
  type Model,
} from "mongoose";

const contactMessageSchema = new Schema(
  {
    name: {
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

    subject: {
      type: String,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["unread", "read", "archived"],
      default: "unread",
      required: true,
    },

    readAt: {
      type: Date,
    },

    readBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export type ContactMessage =
  InferSchemaType<typeof contactMessageSchema>;

export const ContactMessageModel: Model<ContactMessage> =
  (mongoose.models.ContactMessage as Model<ContactMessage>) ||
  mongoose.model<ContactMessage>(
    "ContactMessage",
    contactMessageSchema
  );