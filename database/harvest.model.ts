import mongoose, { Schema, type HydratedDocument, type Model, type Types } from "mongoose";
import { serializeId } from "@/lib/serialize";
import type { QualityGrade } from "@/types";

export type HarvestStatus = "Active" | "Closed" | "Completed" | "Cancelled";

export type IHarvest = {
  farmerId: Types.ObjectId;
  farmerName: string;
  vegetableId: Types.ObjectId;
  vegetableName: string;
  quantityKg: number;
  remainingKg: number;
  qualityGrade: QualityGrade;
  harvestDate: Date;
  expectedDelivery: Date;
  availableUntil: Date;
  status: HarvestStatus;
  applications: number;
  photos: string[];
};

const harvestSchema = new Schema<IHarvest>(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    farmerName: { type: String, required: true, trim: true },
    vegetableId: { type: Schema.Types.ObjectId, ref: "Vegetable", required: true },
    vegetableName: { type: String, required: true, trim: true },
    quantityKg: { type: Number, required: true, min: 1 },
    remainingKg: { type: Number, required: true, min: 0 },
    qualityGrade: { type: String, enum: ["A", "B", "C"], required: true },
    harvestDate: { type: Date, required: true },
    expectedDelivery: { type: Date, required: true },
    availableUntil: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Active", "Closed", "Completed", "Cancelled"],
      default: "Active",
      index: true,
    },
    applications: { type: Number, default: 0 },
    photos: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        return serializeId(ret as unknown as Record<string, unknown>, {
          objectIds: ["farmerId", "vegetableId"],
          dateOnly: ["harvestDate", "expectedDelivery", "availableUntil"],
        });
      },
    },
  }
);

harvestSchema.index({ farmerId: 1, status: 1, createdAt: -1 });
harvestSchema.index({ status: 1, availableUntil: 1 });

export type HarvestDocument = HydratedDocument<IHarvest>;

export const Harvest: Model<IHarvest> =
  (mongoose.models.Harvest as Model<IHarvest>) ||
  mongoose.model<IHarvest>("Harvest", harvestSchema);

export default Harvest;
