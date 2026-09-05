import mongoose, { Schema, type HydratedDocument, type Model, type Types } from "mongoose";

export type UserRole = "farmer" | "trader" | "admin";

export type AccountStatus = "Pending" | "Active" | "Inactive" | "Rejected";

export type INotificationPrefs = {
  offerAlerts: boolean;
  priceBookmarks: boolean;
  announcements: boolean;
  newApplications: boolean;
  acceptedOffers: boolean;
};

export type IUser = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  address: string;
  ruralServicesDivision: string;
  identityFrontUrl: string;
  identityBackUrl: string;
  taxBillUrl: string;
  photoUrl: string;
  memberId?: string;
  status: AccountStatus;
  rejectionReason: string;
  reviewedAt?: Date;
  joinedAt: Date;
  notificationPrefs: INotificationPrefs;
  bookmarkedVegetableIds: Types.ObjectId[];
  lastPriceDigestAt?: Date;
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
    ruralServicesDivision: {
      type: String,
      default: "",
      trim: true,
    },
    identityFrontUrl: {
      type: String,
      default: "",
      trim: true,
    },
    identityBackUrl: {
      type: String,
      default: "",
      trim: true,
    },
    taxBillUrl: {
      type: String,
      default: "",
      trim: true,
    },
    photoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    memberId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Active", "Inactive", "Rejected"],
      default: "Pending",
    },
    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },
    reviewedAt: {
      type: Date,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    notificationPrefs: {
      offerAlerts: { type: Boolean, default: true },
      priceBookmarks: { type: Boolean, default: true },
      announcements: { type: Boolean, default: true },
      newApplications: { type: Boolean, default: true },
      acceptedOffers: { type: Boolean, default: true },
    },
    bookmarkedVegetableIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Vegetable" }],
      default: [],
    },
    lastPriceDigestAt: {
      type: Date,
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
        delete value.lastPriceDigestAt;
        value.bookmarkedVegetableIds = Array.isArray(value.bookmarkedVegetableIds)
          ? value.bookmarkedVegetableIds.map(String)
          : [];
        const prefs = (value.notificationPrefs ?? {}) as Record<string, unknown>;
        value.notificationPrefs = {
          offerAlerts: prefs.offerAlerts !== false,
          priceBookmarks: prefs.priceBookmarks !== false,
          announcements: prefs.announcements !== false,
          newApplications: prefs.newApplications !== false,
          acceptedOffers: prefs.acceptedOffers !== false,
        };
        return value;
      },
    },
  }
);

export type UserDocument = HydratedDocument<IUser>;

if (mongoose.models.User) {
  mongoose.deleteModel("User");
}

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
