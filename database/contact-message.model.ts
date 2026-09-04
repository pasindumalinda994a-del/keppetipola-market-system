import mongoose, {
  Schema,
  type HydratedDocument,
  type Model,
} from "mongoose";
import { serializeId } from "@/lib/serialize";

export type IContactMessage = {
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

const contactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        return serializeId(ret as unknown as Record<string, unknown>, {
          dates: ["createdAt"],
        });
      },
    },
  }
);

contactMessageSchema.index({ createdAt: -1 });

export type ContactMessageDocument = HydratedDocument<IContactMessage>;

export const ContactMessage: Model<IContactMessage> =
  (mongoose.models.ContactMessage as Model<IContactMessage>) ||
  mongoose.model<IContactMessage>("ContactMessage", contactMessageSchema);

export default ContactMessage;
