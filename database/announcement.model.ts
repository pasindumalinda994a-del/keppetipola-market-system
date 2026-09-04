import mongoose, {
  Schema,
  type HydratedDocument,
  type Model,
} from "mongoose";
import { serializeId } from "@/lib/serialize";

export type AnnouncementStatus = "Draft" | "Published";

export type IAnnouncement = {
  title: string;
  body: string;
  status: AnnouncementStatus;
  publishedAt?: Date;
};

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
      index: true,
    },
    publishedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const value = ret as unknown as Record<string, unknown>;
        if (!(value.publishedAt instanceof Date) && value.createdAt instanceof Date) {
          value.publishedAt = value.createdAt;
        }
        return serializeId(value, { dates: ["publishedAt", "createdAt"] });
      },
    },
  }
);

export type AnnouncementDocument = HydratedDocument<IAnnouncement>;

export const Announcement: Model<IAnnouncement> =
  (mongoose.models.Announcement as Model<IAnnouncement>) ||
  mongoose.model<IAnnouncement>("Announcement", announcementSchema);

export default Announcement;
