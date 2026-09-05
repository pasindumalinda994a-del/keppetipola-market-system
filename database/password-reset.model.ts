import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";

export type IPasswordReset = {
  email: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
};

const passwordResetSchema = new Schema<IPasswordReset>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type PasswordResetDocument = HydratedDocument<IPasswordReset>;

if (mongoose.models.PasswordReset) {
  mongoose.deleteModel("PasswordReset");
}

export const PasswordReset: Model<IPasswordReset> =
  mongoose.model<IPasswordReset>("PasswordReset", passwordResetSchema);

export default PasswordReset;
