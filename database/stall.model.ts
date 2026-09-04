import mongoose, {
  Schema,
  type HydratedDocument,
  type Model,
  type Types,
} from "mongoose";
import { serializeId } from "@/lib/serialize";

export type StallStatus = "Pending" | "Active" | "Inactive";

export type IStall = {
  traderId: Types.ObjectId;
  traderName: string;
  name: string;
  location: string;
  license: string;
  contact: string;
  status: StallStatus;
};

const stallSchema = new Schema<IStall>(
  {
    traderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    traderName: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    license: { type: String, default: "", trim: true },
    contact: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["Pending", "Active", "Inactive"],
      default: "Pending",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        return serializeId(ret as unknown as Record<string, unknown>, {
          objectIds: ["traderId"],
        });
      },
    },
  }
);

export type StallDocument = HydratedDocument<IStall>;

export const Stall: Model<IStall> =
  (mongoose.models.Stall as Model<IStall>) ||
  mongoose.model<IStall>("Stall", stallSchema);

export default Stall;
