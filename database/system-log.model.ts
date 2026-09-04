import mongoose, {
  Schema,
  type HydratedDocument,
  type Model,
} from "mongoose";
import { serializeId } from "@/lib/serialize";

export type SystemLogType = "Login" | "Price Update" | "Transaction" | "Error";

export type ISystemLog = {
  type: SystemLogType;
  message: string;
  user?: string;
};

const systemLogSchema = new Schema<ISystemLog>(
  {
    type: {
      type: String,
      enum: ["Login", "Price Update", "Transaction", "Error"],
      required: true,
      index: true,
    },
    message: { type: String, required: true, trim: true },
    user: { type: String, default: "", trim: true, index: true },
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

systemLogSchema.index({ createdAt: -1 });

export type SystemLogDocument = HydratedDocument<ISystemLog>;

export const SystemLog: Model<ISystemLog> =
  (mongoose.models.SystemLog as Model<ISystemLog>) ||
  mongoose.model<ISystemLog>("SystemLog", systemLogSchema);

export default SystemLog;
