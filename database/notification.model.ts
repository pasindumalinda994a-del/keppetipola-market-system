import mongoose, { Schema, type HydratedDocument, type Model, type Types } from "mongoose";
import { serializeId } from "@/lib/serialize";
import type { NotificationItem } from "@/types";

export type NotificationGroup = NotificationItem["group"];

export type INotification = {
  userId: Types.ObjectId;
  group: NotificationGroup;
  title: string;
  message: string;
  read: boolean;
};

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    group: {
      type: String,
      enum: [
        "Offers",
        "Sales",
        "Announcements",
        "System",
        "Applications",
        "Accepted Offers",
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const value = serializeId(ret as unknown as Record<string, unknown>, {
          objectIds: ["userId"],
          dates: ["createdAt"],
        });
        delete value.updatedAt;
        return value;
      },
    },
  }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

export type NotificationDocument = HydratedDocument<INotification>;

export const Notification: Model<INotification> =
  (mongoose.models.Notification as Model<INotification>) ||
  mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;
