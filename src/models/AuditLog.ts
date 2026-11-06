import mongoose, { Schema } from "mongoose";

const auditLogSchema = new Schema(
  {
    actor: {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },

      fullName: {
        type: String,
        trim: true,
      },

      email: {
        type: String,
        lowercase: true,
        trim: true,
      },
    },

    action: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    category: {
      type: String,
      enum: [
        "authentication",
        "administrators",
        "content",
        "media",
        "settings",
        "system",
        "contact"
      ],
      required: true,
    },

    resource: {
      type: {
        type: String,
        trim: true,
      },

      id: {
        type: String,
        trim: true,
      },
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },

    ipAddress: {
      type: String,
      trim: true,
    },

    userAgent: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },

    versionKey: false,
  }
);

// Indexes for common audit-log queries.
auditLogSchema.index({ createdAt: -1 });

auditLogSchema.index({
  category: 1,
  createdAt: -1,
});

auditLogSchema.index({
  "actor.userId": 1,
  createdAt: -1,
});

auditLogSchema.index({
  action: 1,
  createdAt: -1,
});

export type AuditLog = mongoose.InferSchemaType<
  typeof auditLogSchema
>;

export const AuditLogModel: mongoose.Model<AuditLog> =
  (mongoose.models.AuditLog as mongoose.Model<AuditLog>) ??
  mongoose.model<AuditLog>("AuditLog", auditLogSchema);