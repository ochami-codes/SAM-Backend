import mongoose, {
  Schema,
  type InferSchemaType,
  type Model,
} from "mongoose";

const twoFactorChallengeSchema = new Schema(
  {
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
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    consumedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Automatically remove expired challenges.
twoFactorChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type TwoFactorChallenge = InferSchemaType<
  typeof twoFactorChallengeSchema
>;

export const TwoFactorChallengeModel: Model<TwoFactorChallenge> =
  (mongoose.models.TwoFactorChallenge as Model<TwoFactorChallenge>) ||
  mongoose.model<TwoFactorChallenge>(
    "TwoFactorChallenge",
    twoFactorChallengeSchema
  );