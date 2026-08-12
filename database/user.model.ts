import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";

export type UserRole = "farmer" | "trader" | "admin";

export type IUser = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  address: string;
  status: string;
  joinedAt: Date;
};

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["farmer", "trader", "admin"],
      required: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      default: "Active",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: {
      transform(_doc, ret) {
        const value = ret as unknown as Record<string, unknown>;
        value.id = String(value._id);
        delete value._id;
        delete value.__v;
        delete value.password;
        return value;
      },
    },
  }
);

export type UserDocument = HydratedDocument<IUser>;

export const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", userSchema);

export default User;
