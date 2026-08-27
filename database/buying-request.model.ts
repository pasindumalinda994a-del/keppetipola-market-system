import mongoose, { Schema, type HydratedDocument, type Model, type Types } from "mongoose";
import { serializeId } from "@/lib/serialize";
import type { QualityGrade } from "@/types";

export type BuyingRequestStatus = "Active" | "Closed" | "Cancelled";

export type IBuyingRequest = {
  traderId: Types.ObjectId;
  traderName: string;
  vegetableId: Types.ObjectId;
  vegetableName: string;
  quantityKg: number;
  remainingKg: number;
  minPrice: number;
  maxPrice: number;
  preferredGrade: QualityGrade;
  pickupDate: Date;
  closingTime: Date;
  notes: string;
  status: BuyingRequestStatus;
};

const buyingRequestSchema = new Schema<IBuyingRequest>(
  {
    traderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    traderName: { type: String, required: true, trim: true },
    vegetableId: { type: Schema.Types.ObjectId, ref: "Vegetable", required: true },
    vegetableName: { type: String, required: true, trim: true },
    quantityKg: { type: Number, required: true, min: 1 },
    remainingKg: { type: Number, required: true, min: 0 },
    minPrice: { type: Number, required: true, min: 0 },
    maxPrice: { type: Number, required: true, min: 0 },
    preferredGrade: { type: String, enum: ["A", "B", "C"], required: true },
    pickupDate: { type: Date, required: true },
    closingTime: { type: Date, required: true },
    notes: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["Active", "Closed", "Cancelled"],
      default: "Active",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        return serializeId(ret as unknown as Record<string, unknown>, {
          objectIds: ["traderId", "vegetableId"],
          dateOnly: ["pickupDate"],
          dates: ["closingTime"],
        });
      },
    },
  }
);

buyingRequestSchema.index({ status: 1, closingTime: 1 });
buyingRequestSchema.index({ traderId: 1, createdAt: -1 });

export type BuyingRequestDocument = HydratedDocument<IBuyingRequest>;

export const BuyingRequest: Model<IBuyingRequest> =
  (mongoose.models.BuyingRequest as Model<IBuyingRequest>) ||
  mongoose.model<IBuyingRequest>("BuyingRequest", buyingRequestSchema);

export default BuyingRequest;
