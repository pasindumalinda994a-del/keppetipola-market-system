import mongoose, { Schema, type HydratedDocument, type Model, type Types } from "mongoose";
import { serializeId } from "@/lib/serialize";
import type { QualityGrade } from "@/types";

export type ApplicationStatus = "Pending" | "Offered" | "Accepted" | "Cancelled";

export type IApplication = {
  requestId: Types.ObjectId;
  farmerId: Types.ObjectId;
  farmerName: string;
  vegetableName: string;
  quantityKg: number;
  grade: QualityGrade;
  harvestDate: Date;
  status: ApplicationStatus;
};

const applicationSchema = new Schema<IApplication>(
  {
    requestId: { type: Schema.Types.ObjectId, ref: "BuyingRequest", required: true, index: true },
    farmerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    farmerName: { type: String, required: true, trim: true },
    vegetableName: { type: String, required: true, trim: true },
    quantityKg: { type: Number, required: true, min: 1 },
    grade: { type: String, enum: ["A", "B", "C"], required: true },
    harvestDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Pending", "Offered", "Accepted", "Cancelled"],
      default: "Pending",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        return serializeId(ret as unknown as Record<string, unknown>, {
          objectIds: ["requestId", "farmerId"],
          dateOnly: ["harvestDate"],
        });
      },
    },
  }
);

applicationSchema.index({ requestId: 1, farmerId: 1 }, { unique: true });

export type ApplicationDocument = HydratedDocument<IApplication>;

export const Application: Model<IApplication> =
  (mongoose.models.Application as Model<IApplication>) ||
  mongoose.model<IApplication>("Application", applicationSchema);

export default Application;
